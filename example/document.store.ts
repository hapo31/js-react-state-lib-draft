import createStore from "../src/store/store";

type DocumentData = {
  documentId: string;
  name: string;
  text: string;
  updatedAt: Date;
};

type DocumentStore = {
  documents: DocumentData[];
};

export const documentStore = createStore<DocumentStore>(
  async () => {
    const data = await fetch("...");

    return { documents: await data.json() };
  },
  {
    selectors: {
      // store is readonly object
      getDocumentById:
        ({ store }) =>
        (id: string) => {
          return store.documents.find((document) => document.documentId === id);
        },
      // getDocumentName:
      //   ({ self }) =>
      //   (id: string) => {
      //     const document = self.getDocumentById(id);
      //     return document.name;
      //   },
    },
    mutations: {
      // store is immer object
      updateDocument:
        ({ store }) =>
        async (newDocument: DocumentData) => {
          const data = await fetch("/document/update", {
            method: "PATCH",
            body: JSON.stringify({ newDocument }),
          });
          const result = await data.json();

          const index = store.documents.findIndex(
            (doc) => doc.documentId === result.documentId,
          );
          store.documents[index] = result;
        },
    },
  },
);

console.log(documentStore);
