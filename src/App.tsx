import React, { useEffect, useState } from "react";
import { z } from "zod";

const userSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  name: z.string().min(1, { message: "Name is required" }),
  age: z.number().min(18, { message: "Must be 18 or older" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().min(10, { message: "Phone must be at least 10 characters" }),
});

function App() {

  // Initialize form data and state
  const [formData, setFormData] = useState({
    title: "",
    name: "",
    age: "",
    email: "",
    phone: "",
  });

  // Initialize entries and state (load from local storage)
  const [entries, setEntries] = useState(() => {
    // Load existing entries from localStorage or initialize as empty array
    const savedEntries = localStorage.getItem("entries");
    return savedEntries ? JSON.parse(savedEntries) : [];
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Save entries to localStorage whenever they change
  useEffect(() => {
    // Save entries to localStorage whenever they change
    localStorage.setItem("entries", JSON.stringify(entries));
  }, [entries]);

  // Clear local storage (for testing purposes)
  const clearLocalStorage = () => {
    localStorage.removeItem("entries");
    setEntries([]);
  };

  // Update form data when input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate formData using Zod
    const result = userSchema.safeParse({
      ...formData,
      age: Number(formData.age), // Convert age to a number for validation
    });

    if (!result.success) {
      // Collect errors from Zod validation
      const fieldErrors = result.error.errors.reduce(
        (acc, err) => ({
          ...acc,
          [err.path[0]]: err.message,
        }),
        {}
      );
      setErrors(fieldErrors);
    } else {
      // Clear errors and save the new entry
      setErrors({});
      setEntries([...entries, { ...formData, age: Number(formData.age) }]);
      setFormData({
        title: "",
        name: "",
        age: "",
        email: "",
        phone: "",
      });
      alert("Form submitted successfully!");
    }
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

        {/* Kanban Board Section */}
        <div className="flex flex-col w-full text-center">
          <div className="flex flex-row h-full justify-between gap-2">
            <div className="flex-1">
              <b>Unclaimed</b>
              <div className="bg-blue-500 border border-white h-full mt-2">
                {entries.map((entry, index) => (
                  <div key={index} className="bg-white p-2 rounded-md mb-2">
                    <p>{entry.name}</p>
                    <p>{entry.title}</p>
                    <p>{entry.age}</p>
                    <p>{entry.email}</p>
                    <p>{entry.phone}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <b>First Contact</b>
              <div className="bg-blue-500 border border-white h-full mt-2"></div>
            </div>
            <div className="flex-1">
              <b>Preparing Work Offer</b>
              <div className="bg-blue-500 border border-white h-full mt-2"></div>
            </div>
            <div className="flex-1">
              <b>Send to Therapists</b>
              <div className="bg-blue-500 border border-white h-full mt-2"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
}

export default App;
