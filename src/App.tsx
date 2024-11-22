import React, { useEffect, useState } from "react";
import { z } from "zod";

// Define Zod schema for user data
const userSchema = z.object({
  title: z.enum(["Mr", "Ms"], { required_error: "Please select a title" }),
  name: z.string().min(1, "Name is required"),
  age: z.number().min(18, "Must be 18 or older"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 characters"),
  status: z.string().default("unclaimed"),
  id: z.string().optional()
});

// Infer the type from the schema
type UserFormData = z.infer<typeof userSchema>;

// Initial form state derived from the schema
const initialFormState: UserFormData = {
  title: "Mr",
  name: "",
  age: 18,
  email: "",
  phone: "",
  status: "unclaimed"
};

function App() {

  const statusColumns = [ // Dynamic status columns
    { id: 'unclaimed', name: 'Unclaimed' },
    { id: 'first-contact', name: 'First Contact' },
    { id: 'preparing-work-offer', name: 'Preparing Work Offer' },
    { id: 'send-to-therapists', name: 'Send to Therapists' },
  ];

  const [formData, setFormData] = useState<UserFormData>(initialFormState);
  const [entries, setEntries] = useState<UserFormData[]>(() => {
    const saved = localStorage.getItem("entries");
    return saved ? JSON.parse(saved) : [];
  });
  const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});
  const [edit, setEdit] = useState<string>('');

  useEffect(() => {   // Save entries to localStorage whenever they change
    localStorage.setItem("entries", JSON.stringify(entries));
  }, [entries]);

  const clearLocalStorage = () => {   // Clear local storage (testing purposes)
    localStorage.removeItem("entries");
    setEntries([]);
  };

  const handleSubmit = (e: React.FormEvent) => { // Handle form submission
    e.preventDefault();

    const result = userSchema.safeParse(formData);

    if (!result.success) {
      // Convert Zod errors to a simple object
      const formErrors = Object.fromEntries(
        result.error.issues.map(issue => [issue.path[0], issue.message])
      );
      setErrors(formErrors);
      return;
    }

    if (edit) {
      // Update existing entry
      setEntries((prev) =>
        prev.map((entry) => (entry.id === edit ? { ...entry, ...formData } : entry))
      );
    } else {
      // Add new entry
      setEntries((prev) => [...prev, { ...formData, id: Date.now().toString() }]);
    }

    setFormData(initialFormState);
    setErrors({});
    setEdit('');
    alert("Success!");
  };

  // Single handler for all form changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "age" ? Number(value) : value
    }));
    // Clear error for this field as user types
    setErrors(prev => ({ ...prev, [name]: "" }));
  };



  const removeItem = (id: string) => {  // Remove an entry from the list
    const newEntries = entries.filter((entry) => entry.id !== id);
    setEntries(newEntries);
  }

  // Drag and Drop Functions
  const [draggedItem, setDraggedItem] = useState<UserFormData | null>(null);

  const onDragStart = (e: React.DragEvent, entry: UserFormData) => {  // Set the dragged item
    setDraggedItem(entry);
  };

  const onDrop = (e: React.DragEvent, newStatus: string) => { // Handle drop event
    e.preventDefault(); // Prevent default behavior

    if (draggedItem) {
      // Update the entry's status
      const updatedEntries = entries.map((entry: UserFormData) =>
        entry.id === draggedItem.id
          ? { ...entry, status: newStatus }
          : entry
      );

      setEntries(updatedEntries);
      setDraggedItem(null); // Reset dragged item after drop
    }
  };

  const allowDrop = (e: React.DragEvent) => { // Allow drop event
    e.preventDefault(); // Prevent default behavior (blocking drop)
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-5 bg-[#d3e5ed]">
      <button onClick={clearLocalStorage} className="fixed bottom-6 right-10 bg-red-600 text-white rounded-md p-2">Reset Local Storage</button>

      <header className="flex flex-col items-center justify-center text-2xl text-white mb-8">
        <b>Kanban Board</b>

      </header>

      <div className="flex flex-col gap-5 container">

        {/* Drag and Drop Columns */}
        <div className="flex flex-col w-full text-center">
          <div className="flex flex-row h-full justify-between gap-2">

            {statusColumns.map((status, index: number) => (
              (index == 0 ?  // Unclaimed Column
                (
                  <>
                    <div key={index}
                      className="flex-1 bg-transparent min-h-[470px] border-2 border-[#a0bdd1] rounded-xl h-auto mt-2 p-2"
                      onDragOver={allowDrop}       // Allow drop event on each column
                      onDrop={(e) => onDrop(e, status.id)}
                    >
                      <div className="flex justify-between font-semibold text-black mb-2 py-2 px-2">
                        <p>{status.name}</p>
                        <p className="bg-white text-base h-6 w-6 rounded-full">{entries.filter((entry) => entry.status === status.id).length}</p>
                      </div>

                      {/* Scrollable Container */}
                      <div className="overflow-y-scroll flex flex-col gap-1 max-h-[400px] pr-1">
                        {entries
                          .filter((entry) => entry.status === status.id) // Filter entries by status
                          .map((entry) => (

                            // Draggable Card
                            <div
                              key={entry.id}
                              draggable
                              onDragStart={(e) => onDragStart(e, entry)} // Set the dragged item
                              className="flex flex-col gap-[6px] text-start bg-white text-black px-3 py-4 m-1 cursor-grab rounded-lg"
                            >
                              <div className="flex justify-between items-center">
                                <h1 className="capitalize text-lg font-semibold">{entry.title}. {entry.name}</h1>
                                <p className="text-xs text-gray-500">{entry.age} yo</p>
                              </div>

                              <h2 className="text-sm">{entry.email}</h2>

                              <div className="flex justify-between items-center">
                                <h3 className="text-xs text-gray-500">{entry.phone}</h3>

                                {/* Edit/Remove */}
                                <div className="flex items-center gap-1" >

                                  {/* Edit */}
                                  <button
                                    className="p-1"
                                    onClick={() => {
                                      setFormData(entry)
                                      setEdit(entry.id || '')
                                    }}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" /><path d="m15 5 4 4" />
                                    </svg>
                                  </button>

                                  {/* Remove */}
                                  <button
                                    className="text-red-500"
                                    onClick={() => removeItem(entry.id || '')}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-minus"><path d="M5 12h14" />
                                    </svg>
                                  </button>
                                </div>

                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                    <div className="w-[2px] rounded-full h-auto my-2 bg-blue-900" />
                  </>

                )
                :
                ( // Other Columns
                  <div key={index}
                    className={`${(index == 2 || index == 3) ? ('min-h-[188px] h-fit') : ('min-h-[470px] h-auto')}  flex-1 bg-[#bad1e0] rounded-xl mt-2 p-2`}
                    onDragOver={allowDrop}       // Allow drop event on each column
                    onDrop={(e) => onDrop(e, status.id)}
                  >
                    <div className="flex justify-between font-semibold text-black mb-2 py-2 px-2">
                      <p>{status.name}</p>
                      <p className="bg-white text-base h-6 w-6 rounded-full">{entries.filter((entry) => entry.status === status.id).length}</p>
                    </div>

                    {/* Scrollable Container */}
                    <div className={`${(index == 2 || index == 3) ? ('overflow-y-auto') : ('overflow-y-scroll')}  flex flex-col gap-1 max-h-[400px] pr-1`}>
                      {entries
                        .filter((entry) => entry.status === status.id) // Filter entries by status
                        .map((entry) => (

                          // Draggable Card
                          <div
                            key={entry.id}
                            draggable
                            onDragStart={(e) => onDragStart(e, entry)} // Set the dragged item
                            className="flex flex-col gap-[6px] text-start bg-white text-black px-3 py-4 m-1 cursor-grab rounded-lg"
                          >
                            <div className="flex justify-between items-center">
                              <h1 className="capitalize text-lg font-semibold">{entry.title}. {entry.name}</h1>
                              <p className="text-xs text-gray-500">{entry.age} yo</p>
                            </div>

                            <h2 className="text-sm">{entry.email}</h2>

                            <div className="flex justify-between items-center">
                              <h3 className="text-xs text-gray-500">{entry.phone}</h3>

                              {/* Edit/Remove */}
                              <div className="flex items-center gap-1" >

                                {/* Edit */}
                                <button
                                  className="p-1"
                                  onClick={() => {
                                    setFormData(entry)
                                    setEdit(entry.id || '')
                                  }}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" /><path d="m15 5 4 4" />
                                  </svg>
                                </button>

                                {/* Remove */}
                                <button
                                  className="text-red-500"
                                  onClick={() => removeItem(entry.id || '')}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-minus"><path d="M5 12h14" />
                                  </svg>
                                </button>
                              </div>

                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )
              )
            ))}
          </div>

          {/* Edit Popup */}
          {edit !== '' &&
            <div className="fixed top-0 left-0 w-full h-full bg-black/40 flex items-center justify-center">

              <div className="relative bg-white w-[350px] h-auto rounded-lg">
                <div className="flex flex-col items-center p-7 gap-5">
                  <h2 className="text-lg font-bold">Edit Entry</h2>

                  {/* Edit Form */}
                  <form className="flex flex-col items-start gap-4 mt-4" onSubmit={handleSubmit}>

                    {/* Title */}
                    <div className="flex flex-col w-full items-start">
                      <label htmlFor="status">Title:</label>
                      <select
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleFormChange}
                        className="p-2 border rounded-md"
                      >
                        <option disabled value="">Select Title</option>
                        <option value={"Mr"} >
                          Mr
                        </option>
                        <option value={"Ms"}>
                          Ms
                        </option>
                      </select>
                      {errors.status && <p className="text-red-500">{errors.status}</p>}
                    </div>

                    {/* Name */}
                    <div className="flex flex-col w-full items-start">
                      <label htmlFor="name">Name:</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleFormChange}
                        className="w-full p-2 border rounded-md"
                      />
                      {errors.name && <p className="text-red-500">{errors.name}</p>}
                    </div>

                    {/* Age */}
                    <div className="flex flex-col w-full items-start">
                      <label htmlFor="age">Age:</label>
                      <input
                        type="number"
                        id="age"
                        name="age"
                        value={formData.age}
                        onChange={handleFormChange}
                        className="w-full p-2 border rounded-md"
                      />
                      {errors.age && <p className="text-red-500">{errors.age}</p>}
                    </div>

                    {/* Email */}
                    <div className="flex flex-col w-full items-start">
                      <label htmlFor="email">Email:</label>
                      <input
                        type="text"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleFormChange}
                        className="w-full p-2 border rounded-md"
                      />
                      {errors.email && <p className="text-red-500">{errors.email}</p>}
                    </div>

                    {/* Phone */}
                    <div className="flex flex-col w-full items-start">
                      <label htmlFor="phone">Phone:</label>
                      <input
                        type="text"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleFormChange}
                        className="w-full p-2 border rounded-md"
                      />
                      {errors.phone && <p className="text-red-500">{errors.phone}</p>}
                    </div>

                    <button
                      type="submit"
                      className="bg-blue-500 w-[100px] text-white p-2 rounded-md mt-4"
                    >
                      Submit
                    </button>

                  </form>

                  {/* Close Edit Form Button*/}
                  <button
                    className=" absolute top-3 right-3 hover:text-gray-400"
                    onClick={() => setEdit('')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                  </button>

                </div>

              </div>

            </div>
          }

        </div>

        {/* Form Section */}
        {edit == '' &&
          <div className="mt-10">
            <h1 className="text-xl font-semibold">Form</h1>
            <form className="flex flex-col max-w-[210px] gap-4 mt-4" onSubmit={handleSubmit}>

              {/* Title */}
              <div className="flex justify-between">
                <label htmlFor="status">Title:</label>
                <select
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  className="p-2 border rounded-md"
                >
                  <option disabled value="">Select Title</option>
                  <option value={"Mr"} >
                    Mr
                  </option>
                  <option value={"Ms"}>
                    Ms
                  </option>
                </select>
                {errors.status && <p className="text-red-500">{errors.status}</p>}
              </div>

              {/* Name */}
              <div>
                <label htmlFor="name">Name:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  className=" p-2 border rounded-md"
                />
                {errors.name && <p className="text-red-500">{errors.name}</p>}
              </div>

              {/* Age */}
              <div>
                <label htmlFor="age">Age:</label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleFormChange}
                  className=" p-2 border rounded-md"
                />
                {errors.age && <p className="text-red-500">{errors.age}</p>}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email">Email:</label>
                <input
                  type="text"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  className=" p-2 border rounded-md"
                />
                {errors.email && <p className="text-red-500">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone">Phone:</label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  className=" p-2 border rounded-md"
                />
                {errors.phone && <p className="text-red-500">{errors.phone}</p>}
              </div>

              <button
                type="submit"
                className="bg-blue-500 w-[100px] text-white p-2 rounded-md mt-4"
              >
                Submit
              </button>

            </form>
          </div>}

      </div>
    </div>

  );
}

export default App;
