CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT 'Садівник',
  plant_name text NOT NULL DEFAULT 'Монстера',
  device_code text,
  coins integer NOT NULL DEFAULT 1250,
  completed_tasks text[] NOT NULL DEFAULT '{}',
  owned_skins integer[] NOT NULL DEFAULT '{}',
  active_skin integer,
  auto_mode boolean NOT NULL DEFAULT true,
  light_on boolean NOT NULL DEFAULT false,
  sound boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE (display_name, plant_name, active_skin, auto_mode, light_on, sound, updated_at) ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NULLIF(left(trim(NEW.raw_user_meta_data->>'display_name'), 60), ''), NULLIF(NEW.raw_user_meta_data->>'full_name', ''), split_part(NEW.email, '@', 1), 'Садівник'));
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.claim_task(_task text) RETURNS public.profiles LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE p public.profiles;
BEGIN
  IF _task NOT IN ('water','check','chat','review') THEN RAISE EXCEPTION 'Невідоме завдання'; END IF;
  UPDATE public.profiles SET completed_tasks = array_append(completed_tasks, _task), coins = coins + 50, updated_at = now()
  WHERE id = auth.uid() AND NOT (_task = ANY(completed_tasks)) RETURNING * INTO p;
  IF p.id IS NULL THEN SELECT * INTO p FROM public.profiles WHERE id = auth.uid(); END IF;
  RETURN p;
END $$;

CREATE OR REPLACE FUNCTION public.buy_skin(_skin integer, _price integer) RETURNS public.profiles LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE p public.profiles; real_price integer;
BEGIN
  real_price := CASE _skin WHEN 0 THEN 500 WHEN 1 THEN 750 WHEN 2 THEN 1000 ELSE NULL END;
  IF real_price IS NULL THEN RAISE EXCEPTION 'Невідомий скін'; END IF;
  SELECT * INTO p FROM public.profiles WHERE id = auth.uid() FOR UPDATE;
  IF _skin = ANY(p.owned_skins) THEN RETURN p; END IF;
  IF p.coins < real_price THEN RAISE EXCEPTION 'Недостатньо монет'; END IF;
  UPDATE public.profiles SET coins = coins - real_price, owned_skins = array_append(owned_skins, _skin), active_skin = _skin, updated_at = now()
  WHERE id = auth.uid() RETURNING * INTO p;
  RETURN p;
END $$;

CREATE OR REPLACE FUNCTION public.set_device(_code text) RETURNS public.profiles LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE p public.profiles;
BEGIN
  IF _code IS NOT NULL AND upper(trim(_code)) !~ '^SG-[A-Z0-9]{4}-[A-Z0-9]{4}$' THEN
    RAISE EXCEPTION 'Код пристрою має формат SG-XXXX-XXXX';
  END IF;
  UPDATE public.profiles SET device_code = CASE WHEN _code IS NULL THEN NULL ELSE upper(trim(_code)) END, updated_at = now()
  WHERE id = auth.uid() RETURNING * INTO p;
  RETURN p;
END $$;

REVOKE EXECUTE ON FUNCTION public.claim_task(text), public.buy_skin(integer, integer), public.set_device(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_task(text), public.buy_skin(integer, integer), public.set_device(text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  author_name text NOT NULL,
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text NOT NULL CHECK (char_length(comment) BETWEEN 3 AND 1000),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews readable by members" ON public.reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "write own review" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update own review" ON public.reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete own review" ON public.reviews FOR DELETE TO authenticated USING (auth.uid() = user_id);