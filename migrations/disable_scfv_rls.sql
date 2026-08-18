-- Script SQL para desabilitar RLS na tabela participantes_scfv no Supabase
-- Execute no SQL Editor do Supabase se desejar liberar inserções diretas no banco de dados.

ALTER TABLE participantes_scfv DISABLE ROW LEVEL SECURITY;
ALTER TABLE grupos_scfv DISABLE ROW LEVEL SECURITY;
