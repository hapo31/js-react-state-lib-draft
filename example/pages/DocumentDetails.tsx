interface Props {
  documentId: string;
}

function DocumentDetail({ documentId }: Props) {
  // use selectors in store defined
  const document = documentStore.useValue(
    ({ selectors }) => selectors.getDocumentById(documentId),
    [documentId],
  );
  // use instant selector
  const updatedAt = documentStore.useValue(
    ({ selectors }) =>
      format("YYYY-mm-DD", selectors.getDocumentById(documentId).updatedAt),
    [documentId],
  );
  const { updateDocument } = documentStore.useMutation();
  const [text, setText] = useState(document.text);

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
