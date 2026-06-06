-- ============================================================
-- increment_votes(): tek atomik +1 oy artışı (RPC)
-- ============================================================
-- resources_vote_anon RLS politikası `votes = OLD.votes + 1` ve diğer
-- kolonların değişmemesini şart koşuyor; bu fonksiyon tam olarak onu yapar,
-- böylece anon rolüyle (SECURITY INVOKER) çağrıldığında policy'den geçer.

CREATE OR REPLACE FUNCTION increment_votes(row_id UUID)
RETURNS void AS $$
  UPDATE resources SET votes = votes + 1 WHERE id = row_id;
$$ LANGUAGE sql;

GRANT EXECUTE ON FUNCTION increment_votes(UUID) TO anon, authenticated;
