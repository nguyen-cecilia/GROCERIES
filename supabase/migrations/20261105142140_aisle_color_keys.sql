alter table public.sg_aisle alter column color set default 'violet';

update public.sg_aisle
set color = case lower(color)
                when '#9b84b5' then 'violet'
                when '#6087be' then 'blue'
                when '#4bbcc0' then 'cyan'
                when '#4f937f' then 'teal'
                when '#547951' then 'green'
                when '#c5e397' then 'lime'
                when '#d5a332' then 'amber'
                when '#d57b32' then 'orange'
                when '#c94b32' then 'red'
                when '#c47a86' then 'rose'
                when '#8a5a3b' then 'brown'
                when '#8b99a8' then 'slate'
                else 'violet'
    end
where color like '#%';
