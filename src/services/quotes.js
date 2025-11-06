import {
  addDoc, collection, serverTimestamp, onSnapshot,
  query, orderBy, getDocs, where
} from "firebase/firestore";
import { db } from "./firebase";


export async function folioExists(folio) {
  const ref = collection(db, "quotes");
  const q = query(ref, where("folio", "==", folio.trim()));
  const snap = await getDocs(q);
  return !snap.empty;
}


export async function addQuote({ folio, creadoPor, items = [], meta = {} }) {
  const ref = collection(db, "quotes");

  const existe = await folioExists(folio);
  if (existe) {
    const err = new Error(`El folio "${folio}" ya existe en la base de datos.`);
    err.code = "folio-duplicado";
    throw err;
  }

  const lineas = items
    .filter(r => r?.nombre && Number(r?.cantidad) > 0)
    .map(r => {
      const cantidad = Number(r.cantidad) || 0;
      const valorUnitario = Number(r.precio) || 0;
      const subtotal = cantidad * valorUnitario;
      return { producto: r.nombre, cantidad, valorUnitario, subtotal };
    });

  const total = lineas.reduce((a, l) => a + l.subtotal, 0);

  // Guarda en Firestore
  await addDoc(ref, {
    folio: folio.trim(),
    creadoPor: creadoPor ?? "Proveedor",
    items: lineas,
    total,
    ...meta,
    createdAt: serverTimestamp(),
  });
}

export function watchQuotes(cb) {
  const ref = collection(db, "quotes");
  const q = query(ref, orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}
