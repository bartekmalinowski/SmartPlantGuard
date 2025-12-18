<<<<<<< HEAD
# 🌱 SmartPlantGuard
🇵🇱 **Inteligentny system nawadniania roślin oparty na ESP32**

SmartPlantGuard to prosty, ale funkcjonalny projekt automatycznego systemu podlewania roślin, który wykorzystuje mikrokontroler **ESP32**, czujnik wilgotności gleby oraz aplikację mobilną **Blynk**.  
System automatycznie monitoruje poziom wilgotności i podlewa roślinę, gdy gleba jest zbyt sucha.  
Dodatkowo użytkownik otrzymuje powiadomienia push na telefon.

---

## 🧠 Funkcje
- 🌡️ Odczyt wilgotności gleby co **15 sekund**  
- 💧 Automatyczne włączanie pompy, gdy gleba jest sucha  
- 📲 Powiadomienia **Blynk** o podlaniu rośliny  
- 🖼️ Przejrzysty interfejs w aplikacji mobilnej (ikona statusu: gleba sucha / mokra)  
- 🕹️ Możliwość **ręcznego sterowania pompą** z poziomu aplikacji  

---

## 🧰 Wykorzystane komponenty
- **ESP32 DevKit v1**  
- **Czujnik wilgotności gleby** (analogowy)  
- **Moduł przekaźnika**  
- **Pompa 12V DC**  
- **Zasilacz 12V**  
- Przewody, płytka prototypowa  

---

## 🚀 Dalszy rozwój projektu
Projekt SmartPlantGuard będzie rozwijany w ramach **pracy inżynierskiej**, co oznacza znaczną rozbudowę jego możliwości.  
Planowane są m.in.:

- 🌐 **Aplikacja webowa** do zdalnego monitorowania i sterowania systemem z poziomu przeglądarki  
- 🔋 Zasilanie **solarno-bateryjne**  
- 🪴 Obsługa **wielu donic** i stref nawadniania  
- 💧 Czujnik **poziomu wody** w zbiorniku  
- 🏠 Integracja z platformami typu **Home Assistant**  

Celem jest stworzenie kompletnego i skalowalnego systemu **IoT** do inteligentnej pielęgnacji roślin – idealnego do domów, małych ogrodów czy szklarni.

---

## 📜 Licencja
Projekt dostępny na licencji **MIT**.

---

# 🌱 SmartPlantGuard  
🇬🇧 **Smart plant irrigation system based on ESP32**

SmartPlantGuard is a simple yet functional automatic irrigation system powered by an **ESP32** microcontroller, soil moisture sensor, and **Blynk** mobile app.  
The system monitors soil moisture and waters the plant when it gets too dry.  
The user receives push notifications about watering events.

---

## 🧠 Features
- 🌡️ Soil moisture check every **15 seconds**  
- 💧 Automatic pump activation when soil is dry  
- 📲 **Blynk** push notifications when the plant is watered  
- 🖼️ Intuitive mobile interface (status icon: dry/wet)  
- 🕹️ Manual pump control from the app  

---

## 🧰 Components Used
- **ESP32 DevKit v1**  
- **Soil moisture sensor** (analog)  
- **Relay module**  
- **12V DC water pump**  
- **12V power adapter**  
- Jumper wires, breadboard  

---

## 🚀 Ongoing Development
The SmartPlantGuard project will be **expanded as an engineering thesis**, bringing significant enhancements.  
Planned upgrades include:

- 🌐 A **web application** for remote monitoring and control via a browser  
- 🔋 Solar-powered operation  
- 🪴 Multiple plant zone management  
- 💧 Water tank level monitoring  
- 🏠 Integration with platforms like **Home Assistant**  

The long-term goal is to create a complete and scalable **IoT** system for intelligent plant care – suitable for homes, gardens, or small greenhouse environments.

---

## 📜 License
This project is licensed under the **MIT License**.
=======
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
>>>>>>> f210c75 (Finished project)
