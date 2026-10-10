# K-Player

A desktop music player built with Electron, React and SQLite.

[![Latest Release](https://img.shields.io/github/v/release/OWNER/REPOSITORY)](https://github.com/OWNER/REPOSITORY/releases/latest)

## Download

Download the latest version from the **[GitHub Releases](https://github.com/OWNER/REPOSITORY/releases)** page.

Available builds:

| Platform | Formats                      |
| -------- | ---------------------------- |
| Windows  | Installer (`.exe`), Portable |
| Linux    | AppImage, `.tar.gz`          |

**[Download the latest release →](https://github.com/OWNER/REPOSITORY/releases/latest)**

All application binaries are distributed through GitHub Releases.

## Features

* Support for MP3, WAV, FLAC, AAC, M4A, WMA and OGG audio formats
* Audio playback
* Music library management
* Local SQLite database
* Windows and Linux support
* Modern React-based interface
* Interface localization
* Virtualized lists for large music libraries
* Dynamic audio visualizer

## Tech Stack

| Technology       |    Version |
| ---------------- | ---------: |
| Electron         |  `43.3.0+` |
| React            |  `19.2.8+` |
| Vite             |   `8.2.0+` |
| electron-builder | `26.15.3+` |
| better-sqlite3   |  `13.0.3+` |

## Requirements

* Node.js `22+`
* npm `10+`
* Windows or Linux

Check your installed versions:

```bash
node --version
npm --version
```

## Installation

Clone the repository:

```bash
git clone <REPOSITORY_URL>
cd k-player
```

Install dependencies:

```bash
npm install
```

## Development

Start the renderer in development mode:

```bash
cd renderer
npm run dev
```

Start the Electron application:

```bash
npm start
```

## Build

### Windows

```bash
npm run build:win
```

This produces:

* NSIS installer
* Portable version

### Linux

```bash
npm run build:linux
```

This produces:

* AppImage
* `.tar.gz`

### Full build

```bash
npm run build
```

## Architecture

### Main Process

The Electron Main Process is responsible for:

* window management;
* filesystem operations;
* SQLite;
* IPC communication;
* system integrations;
* application lifecycle.

### Renderer

The renderer is built with:

* React
* Vite
* Ant Design
* i18next

It provides the user interface and communicates with the Main Process through IPC.

## Available Scripts

| Command               | Description                           |
| --------------------- | ------------------------------------- |
| `npm start`           | Start the Electron application        |
| `npm run build`       | Build the application                 |
| `npm run build:win`   | Build for Windows                     |
| `npm run build:linux` | Build for Linux                       |
| `npm run rebuild`     | Rebuild native dependencies           |
| `npm run dev`         | Start the renderer development server |
| `npm run lint`        | Run ESLint                            |

## Database

K-Player uses SQLite through `better-sqlite3`.

## Localization

The renderer uses:

* `i18next`
* `react-i18next`
* `i18next-browser-languagedetector`

The application currently supports:

* English
* Russian

## Supported Platforms

| Platform | Distribution             |
| -------- | ------------------------ |
| Windows  | NSIS installer, Portable |
| Linux    | AppImage, `.tar.gz`      |
| macOS    | Not currently supported  |

## Releases

New versions are published on the **[GitHub Releases](https://github.com/OWNER/REPOSITORY/releases)** page.

Each release may contain:

* Windows installer
* Windows Portable version
* Linux AppImage
* Linux `.tar.gz`
* Release notes

For the latest stable version, use:

**[Download Latest Release](https://github.com/OWNER/REPOSITORY/releases/latest)**

## Bug Reports

Found a bug?

Please create an **[Issue](https://github.com/OWNER/REPOSITORY/issues)** and provide as much information as possible.

A useful bug report should include:

* K-Player version;
* operating system and version;
* steps to reproduce the problem;
* expected behavior;
* actual behavior;
* error messages;
* screenshots or logs, if available.

Detailed bug reports make it much easier to reproduce and fix problems.

**Please report bugs instead of simply mentioning them in random discussions or comments.**

## Feature Requests

Have an idea for a new feature or improvement?

Create an **[Issue](https://github.com/OWNER/REPOSITORY/issues)** and describe:

* what you would like to see;
* why the feature would be useful;
* how you expect it to work;
* any additional examples or references.

## License

This project is distributed under the **MIT License**.

See [`LICENSE`](LICENSE) for more information.

## Author

**kanzas-progger**

---

# K-Player

Десктопный музыкальный плеер на Electron, React и SQLite.

[![Latest Release](https://img.shields.io/github/v/release/OWNER/REPOSITORY)](https://github.com/OWNER/REPOSITORY/releases/latest)

## Скачать

Последнюю версию можно скачать на странице **[GitHub Releases](https://github.com/OWNER/REPOSITORY/releases)**.

Доступны следующие сборки:

| Платформа | Форматы                       |
| --------- | ----------------------------- |
| Windows   | Установщик (`.exe`), Portable |
| Linux     | AppImage, `.tar.gz`           |

**[Скачать последнюю версию →](https://github.com/OWNER/REPOSITORY/releases/latest)**

Все готовые версии приложения публикуются через GitHub Releases.

## Возможности

* Поддержка аудиоформатов MP3, WAV, FLAC, AAC, M4A, WMA и OGG
* Воспроизведение аудиофайлов
* Управление музыкальной библиотекой
* Локальная база данных SQLite
* Поддержка Windows и Linux
* Современный интерфейс на React
* Локализация интерфейса
* Виртуализация больших музыкальных списков
* Динамический аудиовизуализатор

## Стек

| Технология       |     Версия |
| ---------------- | ---------: |
| Electron         |  `43.3.0+` |
| React            |  `19.2.8+` |
| Vite             |   `8.2.0+` |
| electron-builder | `26.15.3+` |
| better-sqlite3   |  `13.0.3+` |

## Требования

* Node.js `22+`
* npm `10+`
* Windows или Linux

Проверить установленные версии:

```bash
node --version
npm --version
```

## Установка

Клонировать репозиторий:

```bash
git clone <REPOSITORY_URL>
cd k-player
```

Установить зависимости:

```bash
npm install
```

## Разработка

Запустить renderer в режиме разработки:

```bash
cd renderer
npm run dev
```

Запустить Electron-приложение:

```bash
npm start
```

## Сборка

### Windows

```bash
npm run build:win
```

Создаются:

* NSIS-установщик
* Portable-версия

### Linux

```bash
npm run build:linux
```

Создаются:

* AppImage
* `.tar.gz`

### Полная сборка

```bash
npm run build
```

## Архитектура

### Main Process

Electron Main Process отвечает за:

* управление окнами;
* работу с файловой системой;
* SQLite;
* IPC;
* системные интеграции;
* жизненный цикл приложения.

### Renderer

Renderer построен на:

* React
* Vite
* Ant Design
* i18next

Он отвечает за пользовательский интерфейс и взаимодействует с Main Process через IPC.

## Доступные команды

| Команда               | Описание                            |
| --------------------- | ----------------------------------- |
| `npm start`           | Запуск Electron-приложения          |
| `npm run build`       | Сборка приложения                   |
| `npm run build:win`   | Сборка для Windows                  |
| `npm run build:linux` | Сборка для Linux                    |
| `npm run rebuild`     | Пересборка native-зависимостей      |
| `npm run dev`         | Запуск renderer в режиме разработки |
| `npm run lint`        | Проверка ESLint                     |

## База данных

K-Player использует SQLite через `better-sqlite3`.

## Локализация

Renderer использует:

* `i18next`
* `react-i18next`
* `i18next-browser-languagedetector`

В настоящее время приложение поддерживает:

* English
* Русский

## Поддерживаемые платформы

| Платформа | Распространение           |
| --------- | ------------------------- |
| Windows   | NSIS-установщик, Portable |
| Linux     | AppImage, `.tar.gz`       |
| macOS     | Пока не поддерживается    |

## Релизы

Новые версии публикуются на странице **[GitHub Releases](https://github.com/OWNER/REPOSITORY/releases)**.

Каждый релиз может содержать:

* установщик Windows;
* Portable-версию Windows;
* AppImage для Linux;
* `.tar.gz` для Linux;
* описание изменений.

Последнюю стабильную версию можно скачать здесь:

**[Скачать последнюю версию](https://github.com/OWNER/REPOSITORY/releases/latest)**

## Сообщение об ошибках

Нашли баг?

Создайте **[Issue](https://github.com/OWNER/REPOSITORY/issues)** и предоставьте как можно больше информации.

Хороший отчёт об ошибке должен содержать:

* версию K-Player;
* операционную систему и её версию;
* шаги для воспроизведения проблемы;
* ожидаемое поведение;
* фактическое поведение;
* текст ошибки;
* скриншоты или логи, если они доступны.

Чем подробнее описана проблема, тем проще её воспроизвести и исправить.

**Пожалуйста, сообщайте о багах через Issues, а не только в комментариях или случайных обсуждениях.**

## Предложения новых функций

Есть идея для новой функции или улучшения?

Создайте **[Issue](https://github.com/OWNER/REPOSITORY/issues)** и опишите:

* что вы хотели бы добавить;
* почему эта функция будет полезна;
* как она должна работать;
* дополнительные примеры или ссылки, если они есть.

## Обратная связь

Обратная связь приветствуется.

Вы можете:

* сообщать об ошибках;
* предлагать новые функции;
* предлагать улучшения;
* делиться впечатлениями;
* отправлять Pull Request.

Конструктивные предложения приветствуются.

## Лицензия

Проект распространяется под **MIT License**.

Подробнее см. [`LICENSE`](LICENSE).

## Автор

**kanzas-progger**
