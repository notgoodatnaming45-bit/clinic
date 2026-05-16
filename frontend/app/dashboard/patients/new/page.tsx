// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { createPatient } from "@/lib/api";

// type PatientForm = {
//   first_name: string;
//   last_name: string;
//   date_of_birth: string;
//   mrn: string;
//   injury_date: string;
//   case_status: string;
//   priority: string;
// };

// export default function NewPatientPage() {
//   const router = useRouter();

//   const [form, setForm] = useState<PatientForm>({
//     first_name: "",
//     last_name: "",
//     date_of_birth: "",
//     mrn: "",
//     injury_date: "",
//     case_status: "Intake",
//     priority: "Low",
//   });

//   const [loading, setLoading] = useState(false);

//   async function savePatient(e: React.FormEvent<HTMLFormElement>) {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       await createPatient({
//         first_name: form.first_name,
//         last_name: form.last_name,
//         date_of_birth: form.date_of_birth,
//         mrn: form.mrn,
//         injury_date: form.injury_date,
//         case_status: form.case_status,
//         priority: form.priority,
//       });

//       router.push("/dashboard/patients");
//     } catch (error) {
//       console.error(error);
//       alert("Failed to create patient. Check backend terminal.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-4xl font-bold text-slate-900">Add Patient</h1>
//         <p className="mt-2 text-slate-500">
//           Create a new patient record in PostgreSQL.
//         </p>
//       </div>

//       <form
//         onSubmit={savePatient}
//         className="max-w-3xl space-y-4 rounded-2xl border bg-white p-6 shadow-sm"
//       >
//         <div className="grid gap-4 md:grid-cols-2">
//           <input
//             type="text"
//             className="rounded-xl border p-3"
//             placeholder="First name"
//             value={form.first_name}
//             onChange={(e) =>
//               setForm({ ...form, first_name: e.target.value })
//             }
//             required
//           />

//           <input
//             type="text"
//             className="rounded-xl border p-3"
//             placeholder="Last name"
//             value={form.last_name}
//             onChange={(e) =>
//               setForm({ ...form, last_name: e.target.value })
//             }
//             required
//           />
//         </div>

//         <div>
//           <label className="mb-1 block text-sm font-medium text-slate-600">
//             Date of Birth
//           </label>
//           <input
//             type="date"
//             className="w-full rounded-xl border p-3"
//             value={form.date_of_birth}
//             onChange={(e) =>
//               setForm({ ...form, date_of_birth: e.target.value })
//             }
//             required
//           />
//         </div>

//         <input
//           type="text"
//           className="w-full rounded-xl border p-3"
//           placeholder="MRN / Case Number"
//           value={form.mrn}
//           onChange={(e) => setForm({ ...form, mrn: e.target.value })}
//           required
//         />

//         <div>
//           <label className="mb-1 block text-sm font-medium text-slate-600">
//             Injury Date
//           </label>
//           <input
//             type="date"
//             className="w-full rounded-xl border p-3"
//             value={form.injury_date}
//             onChange={(e) =>
//               setForm({ ...form, injury_date: e.target.value })
//             }
//             required
//           />
//         </div>

//         <select
//           className="w-full rounded-xl border p-3"
//           value={form.case_status}
//           onChange={(e) =>
//             setForm({ ...form, case_status: e.target.value })
//           }
//         >
//           <option value="Intake">Intake</option>
//           <option value="Processing">Processing</option>
//           <option value="Review">Review</option>
//           <option value="Finalized">Finalized</option>
//         </select>

//         <select
//           className="w-full rounded-xl border p-3"
//           value={form.priority}
//           onChange={(e) => setForm({ ...form, priority: e.target.value })}
//         >
//           <option value="Low">Low</option>
//           <option value="Medium">Medium</option>
//           <option value="High">High</option>
//           <option value="Urgent">Urgent</option>
//         </select>

//         <button
//           type="submit"
//           disabled={loading}
//           className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
//         >
//           {loading ? "Saving..." : "Save Patient"}
//         </button>
//       </form>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPatient } from "@/lib/api";

type PatientForm = {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  mrn: string;
  injury_date: string;
  case_status: string;
  priority: string;
};

export default function NewPatientPage() {
  const router = useRouter();

  const [form, setForm] = useState<PatientForm>({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    mrn: "",
    injury_date: "",
    case_status: "Intake",
    priority: "Low",
  });

  const [loading, setLoading] = useState(false);

  async function savePatient(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      await createPatient({
        first_name: form.first_name,
        last_name: form.last_name,
        date_of_birth: form.date_of_birth,
        mrn: form.mrn,
        injury_date: form.injury_date,
        case_status: form.case_status,
        priority: form.priority,
      });
      router.push("/dashboard/patients");
    } catch (error) {
      console.error(error);
      alert("Failed to create patient. Check backend terminal.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl lg:text-4xl">
          Add Patient
        </h1>
        <p className="mt-1 text-sm text-slate-500 sm:mt-2">
          Create a new patient record in PostgreSQL.
        </p>
      </div>

      <form
        onSubmit={savePatient}
        className="w-full space-y-4 rounded-2xl border bg-white p-4 shadow-sm sm:p-6 lg:max-w-3xl"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            type="text"
            className="w-full rounded-xl border p-3 text-sm"
            placeholder="First name"
            value={form.first_name}
            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            required
          />
          <input
            type="text"
            className="w-full rounded-xl border p-3 text-sm"
            placeholder="Last name"
            value={form.last_name}
            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Date of Birth
          </label>
          <input
            type="date"
            className="w-full rounded-xl border p-3 text-sm"
            value={form.date_of_birth}
            onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
            required
          />
        </div>

        <input
          type="text"
          className="w-full rounded-xl border p-3 text-sm"
          placeholder="MRN / Case Number"
          value={form.mrn}
          onChange={(e) => setForm({ ...form, mrn: e.target.value })}
          required
        />

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Injury Date
          </label>
          <input
            type="date"
            className="w-full rounded-xl border p-3 text-sm"
            value={form.injury_date}
            onChange={(e) => setForm({ ...form, injury_date: e.target.value })}
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <select
            className="w-full rounded-xl border p-3 text-sm"
            value={form.case_status}
            onChange={(e) => setForm({ ...form, case_status: e.target.value })}
          >
            <option value="Intake">Intake</option>
            <option value="Processing">Processing</option>
            <option value="Review">Review</option>
            <option value="Finalized">Finalized</option>
          </select>

          <select
            className="w-full rounded-xl border p-3 text-sm"
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50 sm:w-auto"
        >
          {loading ? "Saving..." : "Save Patient"}
        </button>
      </form>
    </div>
  );
}