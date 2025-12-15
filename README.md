# TimeMatch 2

A web app to help people from different countries find perfect meeting times using Svelte 5 and Bulma CSS.

## Features

- Three ways to input location:
  1. Search by typing city/country name
  2. Dropdown to select city
  3. Dropdown to select timezone
- Add multiple participants with their available timeslots
- Real-time matching algorithm that finds perfect and partial matches
- Display results in the requested format with timezone conversions
- Supabase integration for saving and loading meetings

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Supabase Setup

The app is configured to use the provided Supabase instance. Make sure the `meetings` table exists with the following structure:

- `id` (uuid, primary key)
- `name` (text)
- `participants` (jsonb)
- `created_at` (timestamp)

## Usage

1. Enter a meeting name
2. Add participants by clicking "+ Add Participant"
3. For each participant:
   - Enter their name
   - Select their location using one of the three input methods
   - Add their available timeslots
4. View match results in the right panel
5. Save the meeting to Supabase for later retrieval

