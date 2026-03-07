// ========================================
// Widget Drag and Drop
// ========================================

function initDragDrop(app) {
    const headerContent = document.querySelector('.header-content');
    if (!headerContent) return;
    
    const widgets = headerContent.querySelectorAll('.widget:not(.search-widget)');
    let draggedElement = null;
    let draggedClone = null;
    
    widgets.forEach(widget => {
        // Make widgets draggable
        widget.setAttribute('draggable', 'true');
        widget.style.cursor = 'grab';
        
        widget.addEventListener('dragstart', (e) => {
            draggedElement = widget;
            widget.style.cursor = 'grabbing';
            widget.style.opacity = '0.5';
            
            // Create a visual clone for dragging
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', widget.innerHTML);
        });
        
        widget.addEventListener('dragend', (e) => {
            widget.style.opacity = '1';
            widget.style.cursor = 'grab';
            draggedElement = null;
            
            // Remove all drag-over classes
            widgets.forEach(w => w.classList.remove('drag-over'));
        });
        
        widget.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            
            if (widget !== draggedElement) {
                widget.classList.add('drag-over');
            }
        });
        
        widget.addEventListener('dragleave', (e) => {
            widget.classList.remove('drag-over');
        });
        
        widget.addEventListener('drop', (e) => {
            e.preventDefault();
            widget.classList.remove('drag-over');
            
            if (draggedElement && draggedElement !== widget) {
                // Swap elements
                const allWidgets = Array.from(headerContent.querySelectorAll('.widget:not(.search-widget)'));
                const draggedIndex = allWidgets.indexOf(draggedElement);
                const targetIndex = allWidgets.indexOf(widget);
                
                if (draggedIndex < targetIndex) {
                    widget.parentNode.insertBefore(draggedElement, widget.nextSibling);
                } else {
                    widget.parentNode.insertBefore(draggedElement, widget);
                }
                
                // Save widget order
                saveWidgetOrder(app);
            }
        });
    });
}

function saveWidgetOrder(app) {
    const headerContent = document.querySelector('.header-content');
    const widgets = Array.from(headerContent.querySelectorAll('.widget:not(.search-widget)'));
    const order = widgets.map(w => w.id);
    
    app.settings.widgetOrder = order;
    app.saveSettings();
}

function restoreWidgetOrder(app) {
    if (!app.settings.widgetOrder || app.settings.widgetOrder.length === 0) {
        return;
    }
    
    const headerContent = document.querySelector('.header-content');
    const searchWidget = document.querySelector('.search-widget');
    const headerActions = document.querySelector('.header-actions');
    
    // Remove all widgets first
    const widgets = Array.from(headerContent.querySelectorAll('.widget:not(.search-widget)'));
    widgets.forEach(w => w.remove());
    
    // Restore in saved order
    const logoElement = headerContent.querySelector('.logo');
    app.settings.widgetOrder.forEach(widgetId => {
        const widget = document.getElementById(widgetId);
        if (widget) {
            if (searchWidget) {
                headerContent.insertBefore(widget, searchWidget);
            } else if (headerActions) {
                headerContent.insertBefore(widget, headerActions);
            } else {
                headerContent.appendChild(widget);
            }
        }
    });
}
