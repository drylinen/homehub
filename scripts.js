document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab');
    const views = document.querySelectorAll('.view');

    // ── Tab switching ──────────────────────────────
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            views.forEach(v => v.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tab.getAttribute('data-view'))?.classList.add('active');
        });
    });

    // ── Populate grids (5 rows × 10 cols = 50 cells) ──
    const ROWS = 5;
    const COLS = 10;
    const CELLS_PER_GRID = ROWS * COLS;

    document.querySelectorAll('.cells-grid').forEach(grid => {
        for (let i = 0; i < CELLS_PER_GRID; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.setAttribute('draggable', 'true');
            cell.dataset.index = i;
            grid.appendChild(cell);
        }
    });

    // ── Drag-and-drop reordering ───────────────────
    let draggedCell = null;

    document.addEventListener('dragstart', e => {
        const cell = e.target.closest('.cell');
        if (!cell) return;
        draggedCell = cell;
        cell.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    });

    document.addEventListener('dragend', e => {
        const cell = e.target.closest('.cell');
        if (!cell) return;
        cell.classList.remove('dragging');
        draggedCell = null;
        // Clean up any lingering drag-over highlights
        document.querySelectorAll('.cell.drag-over').forEach(c => c.classList.remove('drag-over'));
    });

    document.addEventListener('dragover', e => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const cell = e.target.closest('.cell');
        if (!cell || cell === draggedCell) return;
        cell.classList.add('drag-over');
    });

    document.addEventListener('dragleave', e => {
        const cell = e.target.closest('.cell');
        if (!cell) return;
        cell.classList.remove('drag-over');
    });

    document.addEventListener('drop', e => {
        e.preventDefault();
        const target = e.target.closest('.cell');
        if (!target || !draggedCell || target === draggedCell) {
            target?.classList.remove('drag-over');
            return;
        }

        target.classList.remove('drag-over');

        // Only allow swaps within the same grid
        if (draggedCell.parentElement !== target.parentElement) return;

        const parent = target.parentElement;
        const allCells = [...parent.children];
        const dragIdx = allCells.indexOf(draggedCell);
        const dropIdx = allCells.indexOf(target);

        // Swap the two cells in the DOM
        if (dragIdx < dropIdx) {
            parent.insertBefore(draggedCell, target.nextSibling);
            parent.insertBefore(allCells[dragIdx], allCells[dropIdx].nextSibling);
        } else {
            parent.insertBefore(draggedCell, target);
            parent.insertBefore(allCells[dragIdx], allCells[dropIdx]);
        }
    });
});
