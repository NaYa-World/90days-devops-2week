# Testing Guide - v2 Mobile App

This guide outlines the custom native mobile features built into version 2 (`v2`) of the **90 Days DevOps** Android application and provides step-by-step instructions on how to verify each of them on a real device or emulator.

---

## 1. 🔒 Biometric Security Gate (Study Notes)
* **Feature Description**: Protects personal study notes using native device authentication (Fingerprint, Face ID, or PIN/Passcode).
* **How to Test**:
  1. Open the app and navigate to the **Notes** tab.
  2. If your device has biometrics (fingerprint/face recognition) configured, a dark, glassmorphic lock screen overlay with a pulsing padlock will appear.
  3. The app will automatically prompt your device's native fingerprint/Face ID dialog.
  4. **Android PIN/Passcode Fallback**: If no biometrics are set up on the device or if biometric verification fails, the prompt will fall back to the secure device lock screen (PIN, Pattern, or Password). Confirm that you can verify and unlock the notes using your device PIN/passcode.
  5. Tapping the padlock icon or the "Tap to Unlock" button will re-trigger the biometric prompt if it is dismissed.
  6. *Web Fallback*: Running the app on a web browser or a device without biometrics/passcode configured will bypass this gate automatically.

---

## 2. 💾 Progress Backup & Restore (Settings)
* **Feature Description**: Native lifecycle triggers write application state to secure sandbox files to prevent data loss.
* **How to Test**:
  1. Open the sidebar drawer and tap **Settings & Profile** (renamed from "API Keys" for discoverability).
  2. Scroll down inside the modal to the **Progress Backup & Restore** section.
  3. **Export File**: Tap this button to generate and download a `.json` backup file containing your keys, notes, and study progress.
  4. **Auto-Backup Now**: Tap this button to trigger an immediate save to the native device filesystem sandbox (`devops90_backup.json`).
  5. **Minimize Auto-Save**: Mark a few tasks as complete, press the device **Home** button (minimizing the app), then force close the app. Re-open the app to confirm your progress was successfully saved and loaded.

---

## 3. 📅 Motivational Daily Study Reminders & Custom Time
* **Feature Description**: Schedules recurring daily notifications with motivational study reminders, customizable via a time picker.
* **How to Test**:
  1. Open the sidebar drawer and tap **Settings & Profile**.
  2. Toggle **Study Reminders** to **ON** and grant notification permission.
  3. Select your desired notification time using the **Time Picker** input under "Reminder Time".
  4. Changing the time will automatically reschedule all 7 weekly rotating daily reminders to your selected hour and minute (displayed in the description below the input).
  5. Toggle it **OFF** to cancel all pending reminders.
  6. *Safety Confirmation*: Reminders run 100% locally on-device without Firebase, making it completely crash-safe.

---

## 4. ◑ System Theme Auto-Sync
* **Feature Description**: Synchronizes app appearance with the operating system's theme preference.
* **How to Test**:
  1. Open the sidebar drawer and tap **Settings & Profile**.
  2. Check **Sync with System Theme**.
  3. Open your Android device's settings app, navigate to Display/Theme, and toggle between **Dark Mode** and **Light Mode**.
  4. Return to the app and confirm the styling instantly adapts to match your system setting.

---

## 5. 📳 Haptic Touch Feedbacks
* **Feature Description**: Integrates physical vibration ticks to enhance user engagement.
* **How to Test**:
  1. **Task check-offs**: Navigate to the Roadmap or Focus view. Tap a checkmark to complete a task; you should feel a light haptic tick (`ImpactStyle.Light`).
  2. **Quiz Selection**: Go to the quiz section. Tap a correct answer to feel a light tap, or tap a wrong answer to trigger a double error buzz warning pattern.
  3. **Pomodoro completion**: Go to the Focus tab and finish a Pomodoro focus or break block; you should feel a distinct double heavy vibration confirmation.

---

## 6. ⚡ Home Screen App Shortcuts (Quick Actions)
* **Feature Description**: Long-press quick actions on your device launcher that open the app directly to specific tabs.
* **How to Test**:
  1. Go to your device home screen launcher.
  2. **Long-press** the "90 Days DevOps" app icon.
  3. Verify that 4 quick-action links appear: **Roadmap**, **Notes**, **Focus Timer**, and **QBank**.
  4. Tap **Focus Timer** or **QBank** to open the app and confirm it boots directly to that specific view.

---

## 7. 📡 Offline Banner Layout
* **Feature Description**: Sticky red gradient notification bar indicating network disconnection that slides down smoothly.
* **How to Test**:
  1. Turn on **Airplane Mode** or disable your device Wi-Fi/data.
  2. Verify that a red gradient offline warning banner **slides down smoothly** at the top of the interface, pushing the sticky navigation bar down so they don't overlap.
  3. Re-enable network connectivity and verify that the banner **slides back up out of view**, shifting the top bar back to the top of the screen.

---

## 8. 🔊 Louder Focus Timer Alarm
* **Feature Description**: Synthesizes a loud, repeating digital beep-beep alarm pattern when the Pomodoro focus timer finishes.
* **How to Test**:
  1. Click the **⏱** clock icon in the top bar to open the Focus Timer.
  2. Click **⚙ Setup** and set **Focus** time to `1` minute.
  3. Click **▶** to start the timer.
  4. Let the timer run down to `00:00`.
  5. Verify that a loud, clear, repeating digital beep alarm (4 groups of double-beeps at 1000Hz, triangle wave) plays to alert you.

---

## 9. 📱 Settings Modal Scrolling & Scroll Lock
* **Feature Description**: Fixes viewport clipping on smaller screens and disables background page scrolling.
* **How to Test**:
  1. Click **⚙️ Settings** in the top bar or tap **Settings & Profile** in the hamburger drawer.
  2. Verify the close **X** button is clearly visible at the top.
  3. On a small screen/mobile view, verify you can scroll down the settings content to access the **Progress Backup & Restore** section.
  4. While the settings modal is open, attempt to scroll the dashboard content behind the modal. Verify that the background scroll is completely locked.

---

## 10. 🚫 Hidden Native Scrollbars
* **Feature Description**: Global hide of web-based scrollbars when running on native wrappers (APK/iOS).
* **How to Test**:
  1. Launch the app-v2 APK on an emulator or Android device.
  2. Scroll through the Roadmap list, hamburger drawer, or notes content.
  3. Verify that **no vertical or horizontal scrollbars** are visible in the native application container.
  4. Verify that scrollbars remain visible and functional when using a regular desktop web browser.

---

## 11. 🔙 Double Back Press to Exit
* **Feature Description**: Protects against accidental app closures by requiring double hardware back button taps to exit.
* **How to Test**:
  1. Open the app on an Android device or emulator.
  2. Press the hardware **Back** button. If you are on any tab/view other than the root **Roadmap**, the app will switch back to the **Roadmap** view.
  3. Once on the **Roadmap** view, press the hardware **Back** button once.
  4. Verify that a toast message appears: `"Press back again to exit"`.
  5. Press the **Back** button a second time within 2 seconds. Verify that the application exits.
  6. Confirm that if you wait longer than 2 seconds, a single press will not exit, and instead displays the toast warning again.

---

## 12. 🔍 Accidental Zoom Protection
* **Feature Description**: Completely disables pinch-to-zoom and double-tap zooming inside the APK.
* **How to Test**:
  1. Launch the app-v2 APK on an emulator or Android device.
  2. Navigate through the views (Roadmap, Sandbox, Labs, LinkedIn, QBank, etc.).
  3. Attempt to zoom in by **double-tapping** anywhere on the screen. Verify that the page stays at the correct 1.0 scale and does not zoom in.
  4. Attempt to zoom in or out using a **pinch gesture** (two fingers). Verify that the interface remains locked at the standard viewport size without scaling.

---

## 13. 🏆 Daily DevOps Micro-Challenge
* **Feature Description**: Schedules a daily DevOps MCQ notification. Tapping it (or navigating via the drawer) opens a slide-up card to test daily DevOps knowledge with answers, haptics, confetti, and persistent local storage states.
* **How to Test**:
  1. Enable notifications and set a reminder time. When the scheduled time arrives, tap the resulting notification. Or, open the sidebar drawer and tap **🏆 Daily Challenge**.
  2. Confirm that a beautiful slide-up modal displays the weekday's custom DevOps question and multiple-choice options.
  3. Choose an answer. 
  4. If correct, verify you feel a haptic vibration confirmation and see a burst of colorful confetti.
  5. If incorrect, verify you see a red indicator and a detailed explanation of the concept.
  6. Reopen the drawer and click the challenge again; confirm that the selected option is stored and you cannot re-submit another answer.

---

## 14. 💻 Unified Labs & Sandbox
* **Feature Description**: Consolidates guided scenarios, sequential command line labs (Days 1–10), and free terminal play in a single unified view.
* **How to Test**:
  1. Open the sidebar drawer and tap **Interactive Labs** (or select **DevOps CLI Sandbox** from the main navigation).
  2. Confirm that you see a landing/dashboard page listing three paths: Guided Scenarios, Daily Lab Exercises, and Free Practice.
  3. Click **Daily Labs (Days 1–10)**, select any Day (e.g., Day 1), and complete the task instructions in the simulated terminal.
  4. Confirm that typing the valid solution command correctly triggers a completion message and updates your progress checklist.

---

## 15. 📊 Interactive Analytics & Streak Calendar
* **Feature Description**: A visual statistics dashboard featuring concentric progress rings and a monthly learning streak calendar.
* **How to Test**:
  1. Go to the sidebar drawer and tap **Progress Stats** (or navigate to the Stats tab).
  2. Verify that four glowing concentric HSL progress rings representing Concepts, Code, Quizzes, and Projects are displayed in the SVG chart.
  3. Tap on any of the rings. Verify that the center detail card updates to show the name and completion percentage/count of that ring.
  4. Scroll to the **Streak Calendar**. Confirm that completed study days are marked with glowing indicators or flames.
  5. Tap on any calendar cell. Verify that a daily summary log displays below the calendar, listing every task checked off on that specific day.

---

## 16. ☁️ GitHub Automatic Cloud Sync
* **Feature Description**: Pushes user progress keys and custom study notes automatically to a configured GitHub repository in the background.
* **How to Test**:
  1. Open the sidebar drawer and tap **Settings & Profile**.
  2. Input your GitHub Personal Access Token (PAT), Username, and Repository name, and save.
  3. Go to the Roadmap and toggle a task checkbox, or go to the Notes section and click "Complete Day".
  4. Verify the background task triggers silent API calls to commit the updated `progress.json` to your repository. Check your remote GitHub repo to confirm that `progress.json` was updated or created successfully.



