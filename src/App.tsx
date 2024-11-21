import React, { useEffect, useState } from "react";
import Card from "./components/cards";
import { z } from "zod";

// Define user interface (typescript :D)
interface User {
  id: string;
  title: string;
  name: string;
  age: number;
  email: string;
  phone: string;
  status: string;
}

// Define Zod schema for user data
const userSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  name: z.string().min(1, { message: "Name is required" }),
  age: z.number().min(18, { message: "Must be 18 or older" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().min(10, { message: "Phone must be at least 10 characters" }),
});

function App() {

  // Initialize states
  const [formData, setFormData] = useState({ // Set default values
    id: "",
    title: "",
    name: "",
    age: "",
    email: "",
    phone: "",
    status: "unclaimed",
  });

  const statusColumns = [
    { id: 'unclaimed', name: 'Unclaimed' },
    { id: 'first-contact', name: 'First Contact' },
    { id: 'preparing-work-offer', name: 'Preparing Work Offer' },
    { id: 'send-to-therapists', name: 'Send to Therapists' }
  ];
  const [entries, setEntries] = useState(JSON.parse(localStorage.getItem("entries") || "[]") as User[]); // Initialize entries from localStorage 
  const [errors, setErrors] = useState<Record<string, string>>({}); // Initialize errors


  useEffect(() => {   // Save entries to localStorage whenever they change
    localStorage.setItem("entries", JSON.stringify(entries));
  }, [entries]);

  const clearLocalStorage = () => {   // Clear local storage (testing purposes)
    localStorage.removeItem("entries");
    setEntries([]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {   // Update form data when input changes
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {   // Handle form submission
    e.preventDefault();

    // Validate formData using Zod
    const result = userSchema.safeParse({
      ...formData,
      age: Number(formData.age), // Convert age to a number for validation
    });

    // Collect errors from Zod validation
    if (!result.success) {
      const fieldErrors = result.error.errors.reduce(
        (acc, err) => ({
          ...acc,
          [err.path[0]]: err.message,
        }),
        {}
      );
      setErrors(fieldErrors);
    } else {
      // Clear errors => save the new entry => reset the form
      setErrors({});
      setEntries([...entries, { ...formData, age: Number(formData.age) }]);
      setFormData({
        id: "",
        title: "",
        name: "",
        age: "",
        email: "",
        phone: "",
        status: "unclaimed",
      });
      alert("Form submitted successfully!");
    }
  };

  // Drag and Drop Functions
  const [draggedItem, setDraggedItem] = useState<User | null>(null);

  const onDragStart = (e: React.DragEvent, entry: User) => {  // Set the dragged item
    setDraggedItem(entry);
  };

  const onDrop = (e: React.DragEvent, newStatus: string) => { // Handle drop event
    e.preventDefault(); // Prevent default behavior

    if (draggedItem) {
      // Update the entry's status
      const updatedEntries = entries.map((entry: User) =>
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
    <div className="bg-gray-800 min-h-screen p-5">
      <button onClick={clearLocalStorage} className="fixed top-6 right-10 bg-red-600 text-white rounded-md p-2">Reset Local Storage</button>

      <header className="flex flex-col items-center justify-center text-2xl text-white mb-8">
        <b>Kanban Board</b>

      </header>

      <div className="flex flex-row text-white ">

        {/* Form Section */}

        <div className="flex flex-col gap-4 m-8">
          <b>Form</b>
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="title">Title:</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="ml-2 p-1 border rounded-md"
              />
              {errors.title && <p className="text-red-500">{errors.title}</p>}
            </div>
            <div>
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="ml-2 p-1 border rounded-md"
              />
              {errors.name && <p className="text-red-500">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="age">Age:</label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="ml-2 p-1 border rounded-md"
              />
              {errors.age && <p className="text-red-500">{errors.age}</p>}
            </div>
            <div>
              <label htmlFor="email">Email:</label>
              <input
                type="text"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="ml-2 p-1 border rounded-md"
              />
              {errors.email && <p className="text-red-500">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="phone">Phone:</label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="ml-2 p-1 border rounded-md"
              />
              {errors.phone && <p className="text-red-500">{errors.phone}</p>}
            </div>

            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded-md mt-4"
            >
              Submit
            </button>
          </form>
        </div>



        {/* Drag and Drop Columns */}

        <div className="flex flex-col w-full text-center">
          <div className="flex flex-row h-full justify-between gap-2">
            {statusColumns.map((status, index: number) => (
              <div key={index} className="flex-1">
                <b>{status.name}</b>
                <div
                  className="bg-blue-500 border border-white h-full mt-2 p-2"
                  onDragOver={allowDrop} // Allow drop event on each column
                  onDrop={(e) => onDrop(e, status.id)}
                >
                  {entries
                    .filter((entry) => entry.status === status.id)
                    .map((entry) => (
                      <div
                        key={entry.id}
                        draggable
                        onDragStart={(e) => onDragStart(e, entry)} // Set the dragged item
                        className="bg-white text-black p-2 m-1 rounded cursor-grab"
                      >
                        {entry.name} - {entry.title}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>



      </div>
    </div>

  );
}

export default App;
