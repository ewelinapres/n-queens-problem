from itertools import combinations
from pathlib import Path

def var_dimacs(row: int, col: int, n: int) -> int:
    """Returns the index of a DIMACS variable corresponding to (row,col) square."""
    return row * n + col + 1

def generate_cnf(n: int) -> list[list[int]]:
    clauses = []
    # 1) At least one queen in every row
    for row in range(n):
        clauses.append([var_dimacs(row, col, n) for col in range(n)])
    # 2) At most one queen in every row
    col_combinations = list(combinations(range(n), 2))
    for row in range(n):
        for col1, col2 in col_combinations:
            clauses.append([-var_dimacs(row, col1, n), -var_dimacs(row, col2, n)])
    # 3) At least one queen in every column
    for col in range(n):
        clauses.append([var_dimacs(row, col, n) for row in range(n)])
    # 1) and 2) give us exactly n queens on the chessboard, so from 3) we automatically get exactly one queen in every column
    #4) At most one queen on a "\" diagonal
    diagonals_right = {}
    for row in range(n):
        for col in range(n):
            diagonals_right.setdefault(row - col, []).append((row, col)) #If key "row - col" does not exist, it is created with a value [] and that value is returned by setdefault. If the key exists, its value is returned
    for diagonal in diagonals_right.values():
        for (row1, col1), (row2, col2) in list(combinations(diagonal, 2)):
            clauses.append([-var_dimacs(row1, col1, n), -var_dimacs(row2, col2, n)])
    #4) At most one queen on a "/" diagonal
    diagonals_left = {}
    for row in range(n):
        for col in range(n):
            diagonals_left.setdefault(row + col, []).append((row, col))
    for diagonal in diagonals_left.values():
        for (row1, col1), (row2, col2) in list(combinations(diagonal, 2)):
            clauses.append([-var_dimacs(row1, col1, n), -var_dimacs(row2, col2, n)])
    return clauses

def save_dimacs(clauses: list[list[int]], n: int, output_path: str | Path = None)  -> None:
    """
    Saves the CNF formula in a DIMACS format to a file.\n   
    Input:\n
    clauses - a list of clauses\n
    n - size of the chessboard\n
    output_path - a path to save the file to"""
    if output_path is None:
        output_path = Path("dimacs_formulas") / f"{n}queens_dimacs.txt"
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(f"p cnf {n*n} {len(clauses)}\n")
        for clause in clauses:
            f.write(" ".join(map(str, clause)) + " 0\n")

def main():
    for n in range(1, 101):
        cnf = generate_cnf(n)
        save_dimacs(clauses = cnf, n = n)

if __name__ == "__main__":
    main()