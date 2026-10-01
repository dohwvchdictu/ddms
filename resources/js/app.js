import { HSDropdown } from 'preline';
import './bootstrap';
import 'preline';


function initPrelineElements() {

    console.log('elements init');
    // Initialize all Preline components
    if (window.HSStaticMethods && typeof window.HSStaticMethods.autoInit === 'function') {
        window.HSStaticMethods.autoInit();
    }
    if (window.HSDropdown && typeof window.HSDropdown.autoInit === 'function') {
        window.HSDropdown.autoInit();
    }
    if (window.HSModal && typeof window.HSModal.autoInit === 'function') {
        window.HSModal.autoInit();
    }
    if (window.HSTabs && typeof window.HSTabs.autoInit === 'function') {
        window.HSTabs.autoInit();
    }
    if (window.HSTooltip && typeof window.HSTooltip.autoInit === 'function') {
        window.HSTooltip.autoInit();
    }
    if (window.HSAccordion && typeof window.HSAccordion.autoInit === 'function') {
        window.HSAccordion.autoInit();
    }
    if (window.HSCollapse && typeof window.HSCollapse.autoInit === 'function') {
        window.HSCollapse.autoInit();
    }



}

document.addEventListener('livewire:navigated', () => {
    Livewire.hook('element.init', initPrelineElements);
}, { once: true });

// The header's document search (partials/search-dialog.blade.php), including its "/" shortcut.
import './search-dialog';
// document.addEventListener('livewire:init', () => {
//     Livewire.on('close-modal', ({ class: className }) => {
//         const modal = document.querySelector(className);
//     });
// });

// document.addEventListener('livewire:init', () => {
//     Livewire.hook('component.init', () => {
//         const dropdown = new HSDropdown(document.querySelector('.hs-dropdown'));
//         const openBtn = document.querySelector('#table-actions');

//         openBtn.addEventListener('click', () => {
//             window.HSDropdown.autoInit()
//             window.HSDropdown.open(dropdown);
//         });
//     });
// });

// document.addEventListener('livewire:load', () => {
//     Livewire.hook('page-changed', () => {
//         const dropdown = new HSDropdown(document.querySelector('.hs-dropdown'));
//         const openBtn = document.querySelector('.hs-dropdown-toggle');

//         openBtn.addEventListener('click', () => {
//             console.log('page-changed');
//         });
//     });

// });
