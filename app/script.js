let currentN = null;
let availableSizes = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadAvailableSizes();
});

function loadAvailableSizes() {
    // Generate array of available sizes based on what likely exists
    const select = document.getElementById('board-size');
    
    // Check which solution files exist by trying to load them
    for (let n = 1; n <= 100; n++) {
        availableSizes.push(n);
    }

    // Add options to dropdown
    availableSizes.forEach(size => {
        const option = document.createElement('option');
        option.value = size;
        option.textContent = `${size}x${size}`;
        select.appendChild(option);
    });

    // Set default
    if (availableSizes.length > 0) {
        select.value = availableSizes[0];
    }
}

async function solve() {
    const n = document.getElementById('board-size').value;
    
    if (!n) {
        showMessage('formula-message', 'Select a size first', 'error');
        return;
    }

    currentN = parseInt(n);
    showLoading('formula-loading', true);
    hideMessage('formula-message');

    try {
        // Load formula
        const formulaResponse = await fetch(`../dimacs_formulas/${n}queens_dimacs.txt`);
        if (!formulaResponse.ok) throw new Error('Formula file not found');
        
        const formula = await formulaResponse.text();
        displayFormula(formula, n);
        showMessage('formula-message', `${n}x${n} formula loaded`, 'success');
    } catch (error) {
        showMessage('formula-message', `Error: ${error.message}`, 'error');
        showLoading('formula-loading', false);
        return;
    } finally {
        showLoading('formula-loading', false);
    }

    // Solve
    showLoading('solve-loading', true);
    hideMessage('solve-message');
    document.getElementById('board-empty').style.display = 'none';
    document.getElementById('board-container').style.display = 'none';

    try {
        const response = await fetch(`../solutions/${currentN}queens_sol.txt`);
        if (!response.ok) throw new Error('Solution file not found');
        
        const solutionText = await response.text();
        const board = parseSolution(solutionText, currentN);
        
        if (board) {
            displayBoard(board, currentN);
            document.getElementById('board-container').style.display = 'block';
            showMessage('solve-message', `Solution found`, 'success');
        } else {
            showMessage('solve-message', 'Unsolvable (no valid solution exists)', 'info');
            document.getElementById('board-empty').style.display = 'block';
        }
    } catch (error) {
        showMessage('solve-message', `Error: ${error.message}`, 'error');
        document.getElementById('board-empty').style.display = 'block';
    } finally {
        showLoading('solve-loading', false);
    }
}

function displayFormula(formula, n) {
    const display = document.getElementById('formula-display');
    const lines = formula.trim().split('\n');
    
    // Show first 1000 lines
    const preview = lines.slice(0, 1000).join('\n');
    const total = lines.length;
    
    let html = preview;
    if (total > 1000) {
        html += `\n...\n[${total - 1000} more lines]`;
    }
    
    display.textContent = html;
}

function parseSolution(solutionText, n) {
    // Parse solution literals and convert to board
    const board = Array(n).fill(null).map(() => Array(n).fill(false));
    let queenCount = 0;
    
    const literals = solutionText.trim().split(/\s+/);
    
    for (const lit of literals) {
        const num = parseInt(lit);
        if (num > 0) {
            // Positive literal means queen is placed
            const var_index = num - 1; // Convert to 0-based
            const row = Math.floor(var_index / n);
            const col = var_index % n;
            
            if (row >= 0 && row < n && col >= 0 && col < n) {
                board[row][col] = true;
                queenCount++;
            }
        }
    }
    
    // Check if a valid solution was found 
    if (queenCount !== n) {
        return null; // Invalid/unsolvable
    }
    
    return board;
}

function displayBoard(board, n) {
    const container = document.getElementById('chessboard');
    container.innerHTML = '';
    container.style.gridTemplateColumns = `repeat(${n}, 50px)`;

    for (let row = 0; row < n; row++) {
        for (let col = 0; col < n; col++) {
            const square = document.createElement('div');
            square.className = 'square';
            
            // Checkerboard pattern
            if ((row + col) % 2 === 0) {
                square.classList.add('white');
            } else {
                square.classList.add('black');
            }

            // Add queen if present
            if (board[row][col]) {
                square.classList.add('queen');
                square.textContent = '♛';
            }

            container.appendChild(square);
        }
    }
}

function showLoading(elementId, show) {
    const element = document.getElementById(elementId);
    element.classList.toggle('active', show);
}

function showMessage(elementId, message, type) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.className = `message show ${type}`;
}

function hideMessage(elementId) {
    const element = document.getElementById(elementId);
    element.classList.remove('show');
}
