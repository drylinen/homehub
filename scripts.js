document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab');
    const views = document.querySelectorAll('.view');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Deactivate all tabs
            tabs.forEach(t => t.classList.remove('active'));
            // Hide all views
            views.forEach(v => v.classList.remove('active'));

            // Activate clicked tab
            tab.classList.add('active');

            // Show corresponding view
            const targetId = tab.getAttribute('data-view');
            document.getElementById(targetId)?.classList.add('active');
        });
    });
});
