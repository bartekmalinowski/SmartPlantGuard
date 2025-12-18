# 🌿 SmartPlantGuard

![Project Banner](https://img.shields.io/badge/SmartPlantGuard-v1.0-brightgreen?style=for-the-badge&logo=pino&logoColor=white)
![Tech Stack](https://img.shields.io/badge/Tech-React%20%7C%20ESP32%20%7C%20Supabase-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Completed-success?style=for-the-badge)

**Inteligentny, zautomatyzowany system do monitorowania i nawadniania roślin doniczkowych, oparty na technologii IoT.**

---

## ▶️ Demo

*W tym miejscu możesz umieścić krótki GIF lub wideo prezentujące działanie aplikacji.*

![Demo GIF](https://your-link-to-a-demo-gif.com/demo.gif)

## 🎯 Cel Projektu

Głównym celem projektu "SmartPlantGuard" jest rozwiązanie powszechnego problemu nieprawidłowej pielęgnacji roślin doniczkowych, wynikającego z braku czasu lub doświadczenia. System automatyzuje proces nawadniania i zapewnia stały wgląd w kluczowe parametry środowiskowe, chroniąc rośliny przed przesuszeniem lub przelaniem.

## ✨ Kluczowe Funkcjonalności

*   ✅ **Pełna Autonomia:** System działa w dwóch trybach (Automatycznym i Ręcznym). W trybie automatycznym samodzielnie decyduje o podlewaniu na podstawie danych z czujnika wilgotności gleby.
*   ✅ **Monitoring w Czasie Rzeczywistym:** Nowoczesna aplikacja webowa wyświetla aktualne dane z czujników:
    *   Wilgotność gleby (%)
    *   Temperatura otoczenia (°C)
    *   Poziom wody w zbiorniku (cm)
    *   Stan naładowania baterii (%)
*   ✅ **Zdalna Konfiguracja:** Użytkownik może zdalnie zmieniać tryb pracy oraz parametry automatyki (próg wilgotności, czas pracy pompy, próg alarmowy wody) z poziomu interfejsu.
*   ✅ **Analiza Danych Historycznych:** Interaktywne wykresy prezentują dane z ostatnich 48 godzin, a dzięki Supabase Realtime, nowe pomiary pojawiają się na nich automatycznie, bez odświeżania strony.
*   ✅ **Mechanizmy Bezpieczeństwa:** Wbudowane zabezpieczenie chroni pompę przed pracą "na sucho", blokując jej uruchomienie przy niskim stanie wody w zbiorniku.
*   ✅ **Pamięć Trwała:** Wszystkie ustawienia są zapisywane w pamięci EEPROM mikrokontrolera, co zapewnia ich odporność na restarty i utratę zasilania.

