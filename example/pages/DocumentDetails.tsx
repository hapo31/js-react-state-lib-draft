interface Props {
  documentId: string;
}

function DocumentDetail({ documentId }: Props) {
  // use selectors in store defined
  const { getElementById } = useStoreSelector(documentStore);
  const { updateDocument } = useStoreMutations(documentStore);

  // use instant selector
  const updatedAt = useStoreSelector(
    documentStore,
    ({ selectors }) =>
      format("YYYY-mm-DD", selectors.getDocumentById(documentId).updatedAt),
    [documentId]
  );
  const [text, setText] = useState(getElementById(documentId).text);

  return (
    <div>
      <p>author: {document.name}</p>
      <textarea
        value={text}
        onChange={({ currentTaget }) => setText(currentTaget.value)}
      />
      <button onClick={() => updateDocument({ ...document, text })}>
        Update
      </button>
      <p>last updated: {updatedAt}</p>
    </div>
  );
}
