"use client";

import styles from "./page.module.css";
import { useMemo, useState } from "react";
import debounce from "lodash.debounce";
import { saveAs } from "file-saver";
import Image from "next/image";

type Item = {
  id: number;
  name: string;
};

async function getItems(name: string) {
  if (name.length < 3) {
    return [];
  }

  const res = await fetch(`/api/items?name=${name}`);

  return res.json() as Promise<Item[]>;
}

async function getDocx(id: number) {
  const res = await fetch(`/api/docx?id=${id}`);
  return res.blob();
}

async function login(password: string) {
  const res = await fetch("/api/login", {
    method: "POST",
    body: JSON.stringify({ password }),
  });

  const response = await res.json();

  return response.isAllowed;
}

export default function Home() {
  const [password, setPassword] = useState("");
  const [isAllowed, setIsAllowed] = useState(false);

  const handleLogin = async (password: string) => {
    const isAllowed = await login(password);

    setIsAllowed(isAllowed);
  };

  return !isAllowed ? (
    <div className={styles.loginContainer}>
      <input
        className={styles.input}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Entrez le mot de passe"
      />
      <button className={styles.button} onClick={() => handleLogin(password)}>
        Se connecter
      </button>
    </div>
  ) : (
    <Connected />
  );
}

const Connected = () => {
  const [value, setValue] = useState("");
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showItems, setShowItems] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isHtmlLoading, setIsHtmlLoading] = useState(false);
  const [file, setFile] = useState<Blob>();

  const handleGetItems = useMemo(
    () =>
      debounce(async (e: React.ChangeEvent<HTMLInputElement>) => {
        setFile(undefined);
        setSelectedItem(null);
        setIsLoading(true);
        const data = await getItems(e.target.value);
        setIsLoading(false);
        setItems(data);
        setShowItems(true);
      }, 500),
    []
  );

  const handleGetHtml = async (id: number) => {
    setIsHtmlLoading(true);
    const blob = await getDocx(id);
    setFile(blob);
    setIsHtmlLoading(false);
  };

  return (
    <main className={styles.main}>
      <Image src="/logo.png" alt="logo" width={200} height={50} />
      <h3 className={styles.title}>Knowledge management DOCX extractor</h3>
      <div className={styles.inputContainer}>
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
      </div>
      {isLoading && <div className={styles.loader} />}
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
