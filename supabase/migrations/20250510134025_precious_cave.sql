/*
  # Create notes table for coffee brewing records

  1. New Tables
    - `notes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `grind_size` (integer)
      - `coffee_amount` (integer)
      - `water_ratio` (integer)
      - `total_water` (integer)
      - `notes` (text)
      - `created_at` (timestamp with time zone)

  2. Security
    - Enable RLS on `notes` table
    - Add policies for authenticated users to:
      - Read their own notes
      - Create new notes
*/

CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  grind_size integer NOT NULL,
  coffee_amount integer NOT NULL,
  water_ratio integer NOT NULL,
  total_water integer NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notes"
  ON notes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create notes"
  ON notes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);