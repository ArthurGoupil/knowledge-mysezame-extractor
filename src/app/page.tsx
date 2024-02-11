"use client";

import styles from "./page.module.css";
import { FormEvent, FormEventHandler, useMemo, useState } from "react";
import debounce from "lodash.debounce";
import { saveAs } from "file-saver";
import Image from "next/image";

type Item = {
  id: number;
  name: string;
};

async function getItems(name: string, password: string) {
  if (name.length < 3) {
    return [];
  }

  const res = await fetch(`/api/items?name=${name}`, {
    headers: {
      Autorization: "Bearer " + password,
    },
  });

  if (!res.ok) {
    throw new Error(`Erreur lors du chargement des fiches : ${res.statusText}`);
  }

  return res.json() as Promise<Item[]>;
}

async function getDocx(id: number, password: string) {
  const res = await fetch(`/api/docx?id=${id}`, {
    headers: {
      Autorization: "Bearer " + password,
    },
  });

  if (!res.ok) {
    throw new Error(`Erreur lors du chargement du DOCX : ${res.statusText}`);
  }

  return res.blob();
}

async function login(password: string) {
  const res = await fetch("/api/login", {
    method: "POST",
    body: JSON.stringify({ password }),
  });

  if (!res.ok) {
    throw new Error(`Erreur lors du login : ${res.statusText}`);
  }

  const response = await res.json();

  return response.isAllowed;
}

export default function Home() {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [isAllowed, setIsAllowed] = useState<boolean | undefined>();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      setError(undefined);
      setIsLoading(true);
      const isAllowed = await login(password);
      setIsAllowed(isAllowed);
    } catch (error) {
      setError(String(error));
    } finally {
      setIsLoading(false);
    }
  };

  return !isAllowed ? (
    <div>
      <form className={styles.loginContainer} onSubmit={handleSubmit}>
        <input
          type="password"
          className={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Entrez le mot de passe"
        />
        <button type="submit" className={styles.button}>
          Se connecter
        </button>
      </form>
      <div className={styles.container}>
        {((isAllowed === false && !isLoading) || error) && (
          <div className={styles.error}>{error ?? "Non autorisé"}</div>
        )}
        {isLoading && !error && <div>Chargement...</div>}
      </div>
    </div>
  ) : (
    <Connected password={password} />
  );
}

const Connected = ({ password }: { password: string }) => {
  const [value, setValue] = useState("");
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showItems, setShowItems] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isHtmlLoading, setIsHtmlLoading] = useState(false);
  const [file, setFile] = useState<Blob>();
  const [error, setError] = useState<string | undefined>();

  const handleGetItems = useMemo(
    () =>
      debounce(async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
          setError(undefined);
          setFile(undefined);
          setSelectedItem(null);
          setIsLoading(true);
          const data = await getItems(e.target.value, password);
          setItems(data);
          setShowItems(true);
        } catch (error) {
          setError(String(error));
        } finally {
          setIsLoading(false);
        }
      }, 500),
    [password]
  );

  const handleGetHtml = async (id: number) => {
    try {
      setError(undefined);
      setIsHtmlLoading(true);
      const blob = await getDocx(id, password);
      setFile(blob);
    } catch (error) {
      setError(String(error));
    } finally {
      setIsHtmlLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <Image src="/logo.png" alt="logo" width={200} height={50} />
      <h3 className={styles.title}>Knowledge management DOCX extractor</h3>
      <form className={styles.inputContainer}>
        <input
          type="text"
          className={styles.input}
          onChange={(e) => {
            setValue(e.target.value);
            handleGetItems(e);
          }}
          value={value}
          placeholder="Rechercher une fiche..."
        />
        {selectedItem && (
          <div className={styles.selectedItem}>
            Fiche sélectionnée : <b>{selectedItem.name}</b>
          </div>
        )}
      </form>
      {error && <div className={styles.error}>{error}</div>}
      {isLoading && !error && <div className={styles.loader} />}
      {!isLoading &&
        showItems &&
        items.map((item) => (
          <div
            key={item.id}
            className={styles.item}
            onClick={() => {
              setSelectedItem(item);
              handleGetHtml(item.id);
              setShowItems(false);
            }}
          >
            {item.name}
          </div>
        ))}
      {(file || isHtmlLoading) && (
        <button
          className={styles.button}
          disabled={isHtmlLoading}
          onClick={async () => {
            if (file) {
              saveAs(
                file,
                `${selectedItem?.name.toLowerCase().replace(/\s/g, "-")}.docx`
              );
            }
          }}
        >
          {isHtmlLoading ? "Conversion..." : "Télécharger en DOCX"}
        </button>
      )}
    </main>
  );
};
