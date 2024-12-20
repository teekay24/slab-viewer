document.addEventListener('DOMContentLoaded', () => {
    const tagCheckboxContainer = document.getElementById('tag-checkboxes');
    const playerFilterContainer = document.getElementById('player-checkboxes');
    const photoGallery = document.getElementById('photo-gallery');
    const modal = document.getElementById('photo-modal');
    const modalImage = document.getElementById('modal-image');
    const closeModal = document.querySelector('.close');
    const clearFiltersButton = document.getElementById('clear-filters'); // Reference to clear filters button

    let photosData = []; // Store all photos data to filter
    let allPlayers = []; // Store unique player names
    let lastScrollY = 0; // Store the last scroll position

    // Ensure modal starts hidden
    modal.style.display = 'none';

    function displayPhotos(photos) {
        photoGallery.innerHTML = ''; // Clear the gallery

        // Display each photo
        photos.forEach(photo => {
            const photoItem = document.createElement('div');
            photoItem.className = 'photo-item';

            const photoPath = `./photos/${photo["Photo ID"]}.jpg`;
            const player = photo.Player || '';
            const set = photo.Set || '';

            photoItem.innerHTML = `
                <img src="${photoPath}" alt="${photo.Title}" loading="lazy">
                <p>${player} ${set}</p>
                <a href="#" class="view-full-photo">Enlarge Photo</a>
            `;

            // Append the photo item to the gallery
            photoGallery.appendChild(photoItem);

            // Enlarge photo functionality
            const viewLink = photoItem.querySelector('.view-full-photo');
            viewLink.addEventListener('click', (event) => {
                event.preventDefault();
                modal.style.display = 'flex'; // Show modal in full screen
                modalImage.src = photoPath;

                // Store the current scroll position
                lastScrollY = window.scrollY;

                // Lock the background scroll position
                document.body.style.overflow = 'hidden'; // Disable scrolling
                photoGallery.style.position = 'fixed'; // Lock gallery in place
                photoGallery.style.top = `-${lastScrollY}px`; // Offset gallery by scroll position

                // Maintain the width while the body is fixed
                document.body.style.width = '100%';
            });
        });
    }

    // Modal functionality for enlarging photos
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none'; // Hide modal
        document.body.style.overflow = 'auto'; // Re-enable background scrolling
        document.body.style.position = ''; // Remove fixed positioning

        // Restore gallery scroll position and unlock the gallery
        photoGallery.style.position = '';
        photoGallery.style.top = '';
        window.scrollTo(0, lastScrollY); // Restore the scroll position
    });

    // Close the modal when clicking outside the modal content (background)
    modal.addEventListener('click', (event) => {
        if (event.target === modal) { // Check if the click is on the background, not the modal content
            modal.style.display = 'none'; // Hide modal
            document.body.style.overflow = 'auto'; // Re-enable background scrolling
            document.body.style.position = ''; // Remove fixed positioning

            // Restore gallery scroll position and unlock the gallery
            photoGallery.style.position = '';
            photoGallery.style.top = '';
            window.scrollTo(0, lastScrollY); // Restore the scroll position
        }
    });

    // Clear Filters Button functionality
    clearFiltersButton.addEventListener('click', () => {
        // Reset all filters
        document.querySelectorAll('.tag-filter').forEach(checkbox => {
            checkbox.checked = false;
        });

        document.querySelectorAll('.player-filter').forEach(checkbox => {
            checkbox.checked = false;
        });

        filterPhotosByTagsAndPlayers(); // Reset the gallery display after clearing filters
    });

    // Load CSV file
    Papa.parse('./photos.csv', {
        download: true,
        header: true,
        complete: function(results) {
            photosData = results.data;
            populateTags(photosData);
            populatePlayers(photosData);
            displayPhotos(photosData); // Display all photos initially
        }
    });

    // Handle player filter section toggle
    const playerFilterHeader = document.querySelector('#player-filter h3');
    const playerFilterSection = document.getElementById('player-filter');
    playerFilterHeader.addEventListener('click', () => {
        playerFilterSection.classList.toggle('open');
    });
});

// Back to top button functionality
const backToTopButton = document.getElementById('back-to-top');
window.addEventListener('scroll', () => {
    if (window.scrollY > 200) {
        backToTopButton.style.display = 'flex';
    } else {
        backToTopButton.style.display = 'none';
    }
});
backToTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
