from pathlib import Path
import subprocess

BASE_DIR = Path(__file__).parent

GLUCOSE = BASE_DIR / "glucose.exe"
DIMACS_DIR = BASE_DIR / "dimacs_formulas"
SOL_DIR = BASE_DIR / "solutions"

SOL_DIR.mkdir(exist_ok=True)

for dimacs_file in DIMACS_DIR.glob("*queens_dimacs.txt"):
    # #queens_dimacs.txt -> #queens_sol.txt
    n = dimacs_file.name.split("queens")[0]
    sol_file = SOL_DIR / f"{n}queens_sol.txt"

    print(f"Solving {n}-queens...")

    result = subprocess.run(
        [str(GLUCOSE), str(dimacs_file), str(sol_file)], #solve with glucose
        text=True,
        capture_output=True
    )

    print(result.stdout)

    if sol_file.exists():
        print(f"Saved: {sol_file}")
    else:
        print(f"Could not save solution for {n}-queens")
        print(result.stderr)