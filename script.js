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

    function populateTags(photos) {
        const tagsSet = new Set();
        const excludedTags = new Set(['BRAVES', '', 'All Tags', 'EXPOS', 'PADRES', 'MARINERS', 'INDIANS', 'RANGERS', 'USA', 'TWINS', 'REDINK', 'BLUEINK', 'SILVERINK', 'GOLDINK', 'BLACKINK']);

        // Collect unique tags
        photos.forEach(photo => {
            const tags = (photo.Tags || '').replace(/[()]/g, '').split('/');
            tags.forEach(tag => {
                const trimmedTag = tag.trim();
                if (!excludedTags.has(trimmedTag.toUpperCase())) {
                    tagsSet.add(trimmedTag);
                }
            });
        });

        // Create checkboxes for each tag
        Array.from(tagsSet).sort().forEach(tag => {
            const checkboxDiv = document.createElement('div');
            checkboxDiv.className = 'tag-checkbox';
            checkboxDiv.innerHTML = `
                <input type="checkbox" id="tag-${tag}" class="tag-filter" value="${tag}">
                <label for="tag-${tag}">${tag}</label>
            `;
            tagCheckboxContainer.appendChild(checkboxDiv);
        });

        // Add event listeners for tag filters
        document.querySelectorAll('.tag-filter').forEach(checkbox => {
            checkbox.addEventListener('change', filterPhotosByTagsAndPlayers);
        });
    }

    function populatePlayers(photos) {
        const playersSet = new Set();

        // Collect unique player names
        photos.forEach(photo => {
            const players = (photo.Player || '').split('/');
            players.forEach(player => {
                const trimmedPlayer = player.trim();
                if (trimmedPlayer) {
                    playersSet.add(trimmedPlayer);
                }
            });
        });

        allPlayers = Array.from(playersSet).sort();

        // Create checkboxes for each player
        allPlayers.forEach(player => {
            const checkboxDiv = document.createElement('div');
            checkboxDiv.className = 'player-checkbox';
            checkboxDiv.innerHTML = `
                <input type="checkbox" id="player-${player}" class="player-filter" value="${player}">
                <label for="player-${player}">${player}</label>
            `;
            playerFilterContainer.appendChild(checkboxDiv);
        });

        // Add event listeners for player filters
        document.querySelectorAll('.player-filter').forEach(checkbox => {
            checkbox.addEventListener('change', filterPhotosByTagsAndPlayers);
        });
    }

    function filterPhotosByTagsAndPlayers() {
        // Get all selected tags
        const selectedTags = Array.from(document.querySelectorAll('.tag-filter:checked'))
            .map(checkbox => checkbox.value);

        // Get all selected players
        const selectedPlayers = Array.from(document.querySelectorAll('.player-filter:checked'))
            .map(checkbox => checkbox.value);

        // Filter photos by selected tags first (primary filter)
        const filteredPhotosByTags = photosData.filter(photo => {
            const photoTags = (photo.Tags || '').replace(/[()]/g, '').split('/');
            const photoTagList = photoTags.map(tag => tag.trim());

            // Match all selected tags
            return selectedTags.every(tag => photoTagList.includes(tag));
        });

        // If no tags are selected, show all photos (not filtered by tags)
        const filteredPhotos = selectedTags.length === 0 ? photosData : filteredPhotosByTags;

        // Apply the player filter (secondary filter)
        const finalFilteredPhotos = filteredPhotos.filter(photo => {
            const photoPlayers = (photo.Player || '').split('/');
            const photoPlayerList = photoPlayers.map(player => player.trim());

            // Match any selected players
            return selectedPlayers.length === 0 || selectedPlayers.some(player => photoPlayerList.includes(player));
        });

        displayPhotos(finalFilteredPhotos);
    }

    // Clear all tag and player selections
    function clearTagAndPlayerSelections() {
        document.querySelectorAll('.tag-filter').forEach(checkbox => {
            checkbox.checked = false; // Uncheck all tag checkboxes
        });

        document.querySelectorAll('.player-filter').forEach(checkbox => {
            checkbox.checked = false; // Uncheck all player checkboxes
        });

        filterPhotosByTagsAndPlayers(); // Reset gallery display
    }

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

    // Attach the clear filters button click event
    clearFiltersButton.addEventListener('click', clearTagAndPlayerSelections);

    // Handle player filter section toggle
    const playerFilterHeader = document.querySelector('#player-filter h3');
    const playerFilterSection = document.getElementById('player-filter');
    playerFilterHeader.addEventListener('click', () => {
        playerFilterSection.classList.toggle('open');
    });

    // Mobile Filter Toggle Button (Function definition)
    function toggleFilters() {
        const filters = document.getElementById('filters');
        filters.classList.toggle('open');  // Add/remove 'open' class to toggle visibility
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

    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none'; // Hide modal when clicking outside the image
            document.body.style.overflow = 'auto'; // Re-enable background scrolling
            document.body.style.position = ''; // Remove fixed positioning

            // Restore gallery scroll position and unlock the gallery
            photoGallery.style.position = '';
            photoGallery.style.top = '';
            window.scrollTo(0, lastScrollY); // Restore the scroll position
        }
    });

    // When the page loads, ensure the modal is hidden
    window.addEventListener('DOMContentLoaded', function() {
        modal.style.display = 'none'; // Make sure it's hidden initially
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
