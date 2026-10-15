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

    // ── Shared swap logic ──────────────────────────
    function swapCells(draggedCell, targetCell) {
        if (!draggedCell || !targetCell || draggedCell === targetCell) return;
        if (draggedCell.parentElement !== targetCell.parentElement) return;

        const parent = targetCell.parentElement;
        const allCells = [...parent.children];
        const dragIdx = allCells.indexOf(draggedCell);
        const dropIdx = allCells.indexOf(targetCell);

        // Swap the two cells in the DOM
        if (dragIdx < dropIdx) {
            parent.insertBefore(draggedCell, targetCell.nextSibling);
            parent.insertBefore(allCells[dragIdx], allCells[dropIdx].nextSibling);
        } else {
            parent.insertBefore(draggedCell, targetCell);
            parent.insertBefore(allCells[dragIdx], allCells[dropIdx]);
        }
    }

    // ── Mouse drag-and-drop (desktop) ──────────────
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
        swapCells(draggedCell, target);
    });

    // ── Touch drag-and-drop (Android / iOS) ────────
    let touchStartCell = null;
    let touchClone = null;
    let touchCurrentTarget = null;
    let touchStartX = 0;
    let touchStartY = 0;
    let touchHasMoved = false;
    const MOVE_THRESHOLD = 10; // px before we consider it a drag vs tap

    document.addEventListener('touchstart', e => {
        const cell = e.target.closest('.cell');
        if (!cell) return;

        // Prevent the default browser behavior (scrolling, selection, etc.)
        e.preventDefault();

        touchStartCell = cell;
        touchHasMoved = false;
        touchCurrentTarget = null;

        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;

        // Visual feedback: mark the cell as selected
        cell.classList.add('touch-selected');
    }, { passive: false });

    document.addEventListener('touchmove', e => {
        if (!touchStartCell) return;

        // Prevent scrolling while dragging
        e.preventDefault();

        const touch = e.touches[0];
        const dx = Math.abs(touch.clientX - touchStartX);
        const dy = Math.abs(touch.clientY - touchStartY);

        // Only treat as drag after moving past threshold
        if (dx < MOVE_THRESHOLD && dy < MOVE_THRESHOLD) return;
        touchHasMoved = true;

        // Find which cell the finger is currently over
        // Use document.elementFromPoint since the touched element doesn't change
        const elementUnderTouch = document.elementFromPoint(touch.clientX, touch.clientY);
        const targetCell = elementUnderTouch?.closest('.cell');

        // Clear previous highlight
        if (touchCurrentTarget && touchCurrentTarget !== touchStartCell) {
            touchCurrentTarget.classList.remove('touch-drop-target');
        }

        if (targetCell && targetCell !== touchStartCell) {
            targetCell.classList.add('touch-drop-target');
            touchCurrentTarget = targetCell;
        } else {
            touchCurrentTarget = null;
        }

        // Dim the source cell to show it's being dragged
        touchStartCell.classList.add('dragging');
        touchStartCell.classList.remove('touch-selected');
    }, { passive: false });

    document.addEventListener('touchend', e => {
        if (!touchStartCell) return;

        // Clean up source cell styling
        touchStartCell.classList.remove('dragging', 'touch-selected');

        // Clean up target highlight
        if (touchCurrentTarget) {
            touchCurrentTarget.classList.remove('touch-drop-target');
        }

        // If we moved enough and landed on a different cell, perform the swap
        if (touchHasMoved && touchCurrentTarget) {
            swapCells(touchStartCell, touchCurrentTarget);
        }

        touchStartCell = null;
        touchCurrentTarget = null;
    });

    // Also handle touchcancel (e.g. incoming call interrupts the drag)
    document.addEventListener('touchcancel', e => {
        if (!touchStartCell) return;
        touchStartCell.classList.remove('dragging', 'touch-selected');
        if (touchCurrentTarget) {
            touchCurrentTarget.classList.remove('touch-drop-target');
        }
        touchStartCell = null;
        touchCurrentTarget = null;
    });
});
