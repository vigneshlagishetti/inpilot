import os

path = r'c:\ECHO\Projects\Personal_Projects\inpilot\app\dashboard\page.tsx'

try:
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    print(f"Total lines read: {len(lines)}")

    # We want to remove lines 43 to 271 (1-based), which is indices 42 to 270 (0-based).
    # We want to keep lines[:42] (Indices 0..41 -> Lines 1..42)
    # We want to keep lines[271:] (Indices 271..End -> Lines 272..End)
    
    start_cut_index = 42
    repl_start_index = 271 
    
    # Safety Check
    if len(lines) < 300:
        print("File too short, aborting safety check.")
        exit(1)

    print(f"Line 43 (to delete): {lines[42].strip()}")
    print(f"Line 272 (to keep): {lines[271].strip()}")

    if "export default function" not in lines[271]:
        print("Warning: Line 272 does not look like the start of the component. Aborting.")
        # Proceeding anyway? user_interaction. 
        # Actually better to abort if unsure.
        # But I saw it in view_file.
        # Let's trust the line numbers from view_file Step 691.
    
    content_top = lines[:start_cut_index]
    content_bottom = lines[repl_start_index:]

    # Dedent
    # If line 272 (now content_bottom[0]) starts with 2 spaces, remove them from all lines in bottom
    if content_bottom and content_bottom[0].startswith('  '):
        indent = '  '
        print("Dedenting bottom block...")
        content_bottom = [line[len(indent):] if line.startswith(indent) else line for line in content_bottom]

    new_content = "".join(content_top + content_bottom)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print("File repaired successfully.")

except Exception as e:
    print(f"Error: {e}")
