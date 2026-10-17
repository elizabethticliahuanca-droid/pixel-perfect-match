DROP POLICY IF EXISTS cook_read ON public.cook_profiles;
CREATE POLICY cook_read ON public.cook_profiles FOR SELECT TO authenticated USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.service_requests r WHERE r.cook_id = cook_profiles.id AND r.client_id = auth.uid()));
DROP POLICY IF EXISTS review_read ON public.cook_reviews;
CREATE POLICY review_read ON public.cook_reviews FOR SELECT TO authenticated USING (client_id = auth.uid() OR EXISTS (SELECT 1 FROM public.cook_profiles c WHERE c.id = cook_reviews.cook_id AND c.user_id = auth.uid()));