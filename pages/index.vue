<template>
  <main class="lia-main">
    <section class="list">
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th class="sticky-column">Title</th>
              <th v-for="(date, index) in dates" :key="date">{{ date }}</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, rowIndex) in rows" :key="rowIndex">
              <td class="sticky-column">{{ row.title }}</td>
              <td v-for="(date, colIndex) in dates" :key="date">
                <input
                  type="checkbox"
                  v-model="row.data[date]"
                  class="checkbox"
                  :style="getCheckboxStyle(colIndex)"
                  @change="updateRowInDB(row, rowIndex)"
                />
              </td>
              <td>
                <button @click="removeRow(rowIndex)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <button @click="addRow">Add Row</button>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  getDocs,
  collection,
  deleteDoc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCdmZ-5JPXu13Nd5wdY9uGF_yFpX_JiiVI",
  authDomain: "emnotebook-b1340.firebaseapp.com",
  projectId: "emnotebook-b1340",
  storageBucket: "emnotebook-b1340.appspot.com",
  messagingSenderId: "26102216592",
  appId: "1:26102216592:web:d8caf4d5522730ff182515",
  measurementId: "G-F24TS1YEHD",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const getMonthDates = () => {
  const dates = [];
  const today = new Date();
  const month = today.getMonth() + 1;

  const daysInMonth = new Date(today.getFullYear(), month, 0).getDate();
  for (let day = 1; day <= daysInMonth; day++) {
    dates.push(
      `${String(day).padStart(2, "0")}.${String(month).padStart(2, "0")}`
    );
  }
  return dates;
};

const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const dates = getMonthDates();
const colors = dates.map(() => getRandomColor());

const rows = ref<{ title: string; data: Record<string, boolean> }[]>([]);

const addRow = async () => {
  const title = prompt("Enter title for the row:");
  if (title) {
    const newRow = {
      title,
      data: Object.fromEntries(dates.map((date) => [date, false])),
    };
    rows.value.push(newRow);
    await saveRowToDB(newRow);
  }
};

const removeRow = async (index: number) => {
  const row = rows.value[index];
  await deleteDoc(doc(db, "rows", row.title));
  rows.value.splice(index, 1);
};

const getCheckboxStyle = (colIndex: number) => ({
  "--checked-color": colors[colIndex],
});



const saveRowToDB = async (row: {
  title: string;
  data: Record<string, boolean>;
}) => {
  try {
    await setDoc(doc(db, "rows", row.title), row);
  } catch (error) {
    console.error("Error saving row:", error);
  }
};

const updateRowInDB = async (
  row: { title: string; data: Record<string, boolean> },
  index: number
) => {
  try {
    await saveRowToDB(row);
  } catch (error) {
    console.error("Error updating row:", error);
  }
};

const fetchRowsFromDB = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "rows"));
    rows.value = querySnapshot.docs.map(
      (doc) => doc.data() as { title: string; data: Record<string, boolean> }
    );
  } catch (error) {
    console.error("Error fetching rows:", error);
  }
};

onMounted(() => {
  fetchRowsFromDB();
});
</script>

<style scoped lang="scss">
.lia-main {
  width: 100dvw;
  height: 100dvh;
  padding: 30px;
  margin: 0;

  .list {
    .table-wrapper {
      width: 100%;
      overflow-x: auto;
    }

    table {
      width: max-content;
      border-collapse: collapse;
    }

    th,
    td {
      border: 1px solid #ccc;
      padding: 10px;
      text-align: center;
      white-space: nowrap;
    }

    thead {
      background-color: #f5f5f5;
    }

    .sticky-column {
      position: sticky;
      left: 0;
      background-color: #fff;
      z-index: 2;
    }

    button {
      margin-top: 10px;
      cursor: pointer;
    }

    .checkbox {
      appearance: none;
      -webkit-appearance: none;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 2px solid #999;
      transition: background-color 0.3s, border-color 0.3s;

      &:checked {
        background-color: var(--checked-color, #4caf50);
        border-color: var(--checked-color, #4caf50);
      }
    }
  }
}
</style>
