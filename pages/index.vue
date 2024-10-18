<template>
  <main class="lia-main">
    <div class="data-picker">
      <FloatLabel variant="on">
        <DatePicker
          v-model="pickedDate"
          showIcon
          fluid
          iconDisplay="input"
          inputId="on_label"
          view="month"
          dateFormat="mm/yy"
        />
        <label for="on_label">Pick a date</label>
      </FloatLabel>
    </div>
    <section class="list">
      <div class="table-wrapper">
        <DataTable :value="rows" scrollable showGridlines scrollHeight="500px">
          <!-- Column for Titles -->
          <Column field="title" header="Title" frozen></Column>

          <!-- Dynamic Columns for Dates -->
          <Column
            v-for="(date, index) in dates"
            :key="date"
            :field="'data[' + date + ']'"
            :header="getDayFromDate(date)"
          >
            <template #body="slotProps">
              <input
                type="checkbox"
                v-model="slotProps.data.data[date]"
                class="checkbox"
                :style="getCheckboxStyle(index)"
                @change="updateRowInDB(slotProps.data)"
              />
            </template>
          </Column>

          <!-- Actions Column -->
          <Column header="Actions">
            <template #body="slotProps">
              <button @click="removeRow(slotProps.index)">Delete</button>
            </template>
          </Column>
        </DataTable>
      </div>
      <button @click="addRow">Add Row</button>
    </section>
    <div v-if="isLoader" class="loader animate__animated animate__fadeIn">
      <span class="spinner"></span>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  getDocs,
  collection,
  deleteDoc,
} from "firebase/firestore";

// Интерфейс для строки таблицы
interface Row {
  title: string;
  data: { [date: string]: boolean }; // объект, где ключи - даты, значения - булевы флаги (чекбоксы)
  month: string;
  year: string;
}

const isLoader = ref(false); // индикатор загрузки
const pickedDate = ref<Date | null>(new Date()); // выбранная дата (начальная установка - текущая дата)
const rows = ref<Row[]>([]); // массив строк таблицы

const firebaseConfig = {
  apiKey: "AIzaSyCdmZ-5JPXu13Nd5wdY9uGF_yFpX_JiiVI",
  authDomain: "emnotebook-b1340.firebaseapp.com",
  projectId: "emnotebook-b1340",
  storageBucket: "emnotebook-b1340.appspot.com",
  messagingSenderId: "26102216592",
  appId: "1:26102216592:web:d8caf4d5522730ff182515",
  measurementId: "G-F24TS1YEHD",
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Функция для получения дат текущего месяца
const getMonthDates = (): string[] => {
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

// Генерация случайного цвета для чекбоксов
const getRandomColor = (): string => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const dates = getMonthDates(); // массив дат месяца
const colors = dates.map(() => getRandomColor()); // цвета для чекбоксов

// Добавление новой строки
const addRow = async (): Promise<void> => {
  const title = prompt("Enter title for the row:");
  if (title && pickedDate.value) {
    const [month, year] = pickedDate.value
      .toLocaleDateString("en-GB", {
        month: "2-digit",
        year: "numeric",
      })
      .split("/");

    const newRow: Row = {
      title,
      data: Object.fromEntries(dates.map((date) => [date, false])),
      month: month as string,
      year: year as string,
    };

    rows.value.push(newRow);
    await saveRowToDB(newRow, month, year);
  }
};

// Удаление строки
const removeRow = async (index: number): Promise<void> => {
  const row = rows.value[index];
  await deleteDoc(doc(db, `rows/${row.year}/${row.month}`, row.title));
  rows.value.splice(index, 1);
};

// Получение стиля для чекбоксов
const getCheckboxStyle = (colIndex: number): { [key: string]: string } => ({
  "--checked-color": colors[colIndex],
});

// Сохранение строки в Firebase
const saveRowToDB = async (
  row: Row,
  month: string,
  year: string
): Promise<void> => {
  try {
    await setDoc(doc(db, `rows/${year}/${month}`, row.title), row);
  } catch (error) {
    console.error("Error saving row:", error);
  }
};

// Обновление строки в Firebase
const updateRowInDB = async (row: Row): Promise<void> => {
  try {
    await saveRowToDB(row, row.month, row.year);
  } catch (error) {
    console.error("Error updating row:", error);
  }
};

// Получение строк из Firebase
const fetchRowsFromDB = async (): Promise<void> => {
  if (!pickedDate.value) return;

  const [month, year] = pickedDate.value
    .toLocaleDateString("en-GB", {
      month: "2-digit",
      year: "numeric",
    })
    .split("/");

  isLoader.value = true;
  try {
    const querySnapshot = await getDocs(
      collection(db, `rows/${year}/${month}`)
    );
    rows.value = querySnapshot.docs.map((doc) => doc.data() as Row);
  } catch (error) {
    console.error("Error fetching rows:", error);
  } finally {
    isLoader.value = false;
  }
};

const getDayFromDate = (dateString: string): string => {
  return dateString.split(".")[0]; // Разделяем строку по точке и берем первый элемент
};

// const convertOldDataToNew = (oldData: OldDataFormat): Row => {
//   const today = new Date();
//   const month = String(today.getMonth() + 1).padStart(2, "0"); // Текущий месяц
//   const year = String(today.getFullYear()); // Текущий год

//   return {
//     ...oldData, // Переносим данные и заголовок
//     month, // Добавляем текущий месяц
//     year, // Добавляем текущий год
//   };
// };

// const migrateOldData = async () => {
//   try {
//     // Извлечение старых данных
//     const oldQuerySnapshot = await getDocs(collection(db, "rows"));

//     // Обрабатываем каждый документ старой коллекции
//     for (const docSnap of oldQuerySnapshot.docs) {
//       const oldData = docSnap.data() as OldDataFormat;
//       const newData = convertOldDataToNew(oldData); // Преобразование

//       const { month, year, title } = newData;

//       // Сохраняем данные по новому пути
//       await setDoc(doc(db, `rows/${year}/${month}`, title), newData);

//       // Удаляем старый документ
//       await deleteDoc(doc(db, "rows", docSnap.id));
//     }

//     console.log("Migration completed successfully!");
//   } catch (error) {
//     console.error("Error during migration:", error);
//   }
// };

// Обновление строк при изменении даты
watch(pickedDate, fetchRowsFromDB);

// Выполнение кода при монтировании компонента
onMounted(fetchRowsFromDB);
</script>

<style scoped lang="scss">
.lia-main {
  position: relative;
  width: 100dvw;
  height: fit-content;
  padding: 30px;
  margin: 0;
  overflow: hidden;

  .data-picker {
    max-width: 100%;
    margin-bottom: 20px;
  }
  .loader {
    position: fixed;
    inset: 0;
    background-color: rgba(56, 54, 54, 0.441);
    opacity: 0.3;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    .spinner {
      width: 48px;
      height: 48px;
      border: 5px solid #fff;
      border-bottom-color: transparent;
      border-radius: 50%;
      display: inline-block;
      box-sizing: border-box;
      animation: rotation 1s linear infinite;
    }

    @keyframes rotation {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  }
  .list {
    .table-wrapper {
      width: 100%;
      // overflow-x: auto;
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
