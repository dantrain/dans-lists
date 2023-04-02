import { type FormEvent } from "react";
import { api } from "~/utils/api";

interface FormElements extends HTMLFormControlsCollection {
  addListInput: HTMLInputElement;
}
interface AddListFormElement extends HTMLFormElement {
  readonly elements: FormElements;
}

const AddList = () => {
  const utils = api.useContext();

  const createList = api.example.createList.useMutation({
    onSettled: () => void utils.example.getLists.invalidate(),
  });

  return (
    <form
      onSubmit={(e: FormEvent<AddListFormElement>) => {
        e.preventDefault();

        const title = e.currentTarget.elements.addListInput.value.trim();

        if (title) {
          createList.mutate({ title });
        }

        e.currentTarget.elements.addListInput.value = "";
      }}
    >
      <input
        id="addListInput"
        className="mb-4 w-full rounded-md bg-white/10 px-2 py-1 placeholder:text-gray-400"
        type="text"
        placeholder="Add a list"
        autoComplete="off"
      />
    </form>
  );
};

export default AddList;
