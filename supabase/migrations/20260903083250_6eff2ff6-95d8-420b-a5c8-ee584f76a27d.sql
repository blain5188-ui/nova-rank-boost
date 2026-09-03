-- TOURNAMENTS: published flag
ALTER TABLE public.tournaments ADD COLUMN IF NOT EXISTS published boolean NOT NULL DEFAULT true;

-- BLOG: category + author
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'news';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS author text;

-- TEAMS
CREATE TABLE IF NOT EXISTS public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  name text NOT NULL,
  tag text,
  points integer NOT NULL DEFAULT 0,
  wins integer NOT NULL DEFAULT 0,
  losses integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.teams TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.teams TO authenticated;
GRANT ALL ON public.teams TO service_role;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.team_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  epic_name text,
  role text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.team_players TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_players TO authenticated;
GRANT ALL ON public.team_players TO service_role;
ALTER TABLE public.team_players ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.tournament_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  round integer NOT NULL DEFAULT 1,
  team_a_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  team_b_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  score_a integer NOT NULL DEFAULT 0,
  score_b integer NOT NULL DEFAULT 0,
  scheduled_at timestamptz NOT NULL DEFAULT now(),
  status public.match_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tournament_matches TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tournament_matches TO authenticated;
GRANT ALL ON public.tournament_matches TO service_role;
ALTER TABLE public.tournament_matches ENABLE ROW LEVEL SECURITY;

-- POLICIES
CREATE POLICY "teams public read" ON public.teams FOR SELECT USING (true);
CREATE POLICY "teams admin write" ON public.teams FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "team_players public read" ON public.team_players FOR SELECT USING (true);
CREATE POLICY "team_players admin write" ON public.team_players FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "tournament_matches public read" ON public.tournament_matches FOR SELECT USING (true);
CREATE POLICY "tournament_matches admin write" ON public.tournament_matches FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "tournaments admin write" ON public.tournaments;
CREATE POLICY "tournaments admin write" ON public.tournaments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "blog admin write" ON public.blog_posts;
CREATE POLICY "blog admin write" ON public.blog_posts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS teams_updated_at ON public.teams;
CREATE TRIGGER teams_updated_at BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS tournament_matches_updated_at ON public.tournament_matches;
CREATE TRIGGER tournament_matches_updated_at BEFORE UPDATE ON public.tournament_matches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- SEED demo tournament
INSERT INTO public.tournaments (slug, title, description, mode, size, region, prize_cents, entry_fee_cents, status, starts_at, max_entries, published)
VALUES ('nova-winter-cup-2v2', 'Nova Winter Cup 2v2', 'Torneo demo 2v2 Realistics su server EU. 4 squadre, girone unico, premi in cash.', 'realistics', '2v2', 'EU', 25000, 0, 'live', now() + interval '2 days', 16, true)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, published = true;

DO $$
DECLARE t_id uuid; a uuid; b uuid; c uuid; d uuid;
BEGIN
  SELECT id INTO t_id FROM public.tournaments WHERE slug = 'nova-winter-cup-2v2';
  DELETE FROM public.tournament_matches WHERE tournament_id = t_id;
  DELETE FROM public.teams WHERE tournament_id = t_id;

  INSERT INTO public.teams (tournament_id, name, tag, points, wins, losses) VALUES (t_id,'Nova Vipers','VPR',6,2,0) RETURNING id INTO a;
  INSERT INTO public.teams (tournament_id, name, tag, points, wins, losses) VALUES (t_id,'Frost Legion','FRL',3,1,1) RETURNING id INTO b;
  INSERT INTO public.teams (tournament_id, name, tag, points, wins, losses) VALUES (t_id,'Aurora Squad','AUR',3,1,1) RETURNING id INTO c;
  INSERT INTO public.teams (tournament_id, name, tag, points, wins, losses) VALUES (t_id,'Midnight Crew','MDN',0,0,2) RETURNING id INTO d;

  INSERT INTO public.team_players (team_id, display_name, epic_name, role) VALUES
    (a,'Leo','nova_leo','IGL'), (a,'Marta','nova_marta','Fragger'),
    (b,'Kiro','frl_kiro','IGL'), (b,'Sasha','frl_sasha','Support'),
    (c,'Dario','aur_dario','IGL'), (c,'Yuki','aur_yuki','Fragger'),
    (d,'Nico','mdn_nico','IGL'), (d,'Bea','mdn_bea','Support');

  INSERT INTO public.tournament_matches (tournament_id, round, team_a_id, team_b_id, score_a, score_b, scheduled_at, status) VALUES
    (t_id,1,a,b,3,1, now() - interval '2 hours','confirmed'),
    (t_id,1,c,d,3,0, now() - interval '1 hour','confirmed'),
    (t_id,2,a,c,3,2, now() - interval '20 minutes','confirmed'),
    (t_id,2,b,d,0,0, now() + interval '1 day','pending');
END $$;

-- blog categories on existing posts
UPDATE public.blog_posts SET category = 'guide' WHERE slug = 'guida-boxfights';
UPDATE public.blog_posts SET category = 'payouts' WHERE slug = 'come-guadagnare-con-nova';
UPDATE public.blog_posts SET category = 'news' WHERE slug = 'nova-ranked-vs-token';