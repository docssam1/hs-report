begin;

-- The O/X projection remains the existing scoring contract. Only Signature
-- records may carry the extra distinction between wrong (X) and blank (-).
-- NULL means a legacy answer sheet whose blanks cannot be reconstructed.
alter table public.mock_results
  add column if not exists answer_states text;

alter table public.mock_results
  add constraint mock_results_signature_answer_states_ck
  check (
    answer_states is null
    or (
      round ~ '^original[12](@[23])?$'
      and source is distinct from 'reset'
      and answer_states ~ '^[OX-]{30}$'
      and translate(answer_states, '-', 'X') = ox
    )
  ) not valid;

alter table public.mock_results validate constraint mock_results_signature_answer_states_ck;

commit;
