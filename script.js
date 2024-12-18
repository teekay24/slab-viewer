document.addEventListener('DOMContentLoaded', () => {
    const tagCheckboxContainer = document.getElementById('tag-checkboxes');
    const photoGallery = document.getElementById('photo-gallery');
    const modal = document.getElementById('photo-modal');
    const modalImage = document.getElementById('modal-image');
    const closeModal = document.querySelector('.close');
    const clearFiltersButton = document.getElementById('clear-filters');
    const playerCheckboxContainer = document.getElementById('player-checkboxes');
    const togglePlayerFilterButton = document.getElementById('toggle-player-filter');
    const playerFilterSection = document.getElementById('player-filter-section');

    let photosData = []; // Store all photos data to filter

    // Toggle the visibility of the player filter section
    togglePlayerFilterButton.addEventListener('click', () => {
        const isVisible = playerFilterSection.style.display === 'block';
        playerFilterSection.style.display = isVisible ? 'none' : 'block';
        togglePlayerFilterButton.textContent = isVisible ? 'Show Player Filter' : 'Hide Player Filter';
    });

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
                modal.style.display = 'block';
                modalImage.src = photoPath;
            });
        });
    }

    function populateTags(photos) {
        const tagsSet = new Set();
        const excludedTags = new Set(['BRAVES', '', 'All Tags', 'EXPOS', 'PADRES', 'MARINERS', 'INDIANS', 'RANGERS', 'USA', 'TWINS']);

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
            checkbox.addEventListener('change', filterPhotos);
        });
    }

    function populatePlayers(photos) {
        const playersSet = new Set();

        // Collect unique players, accounting for multiple players in one entry
        photos.forEach(photo => {
            const players = (photo.Player || '').split('/');
            players.forEach(player => {
                playersSet.add(player.trim());
            });
        });

        // Create radio buttons for each player (only one can be selected)
        Array.from(playersSet).sort().forEach(player => {
            const radioDiv = document.createElement('div');
            radioDiv.className = 'player-radio';
            radioDiv.innerHTML = `
                <input type="radio" name="player-filter" id="player-${player}" class="player-filter" value="${player}">
                <label for="player-${player}">${player}</label>
            `;
            playerCheckboxContainer.appendChild(radioDiv);
        });

        // Add event listeners for player filters
        document.querySelectorAll('.player-filter').forEach(radio => {
            radio.addEventListener('change', filterPhotos);
        });
    }

    function filterPhotos() {
        // Get selected tags
        const selectedTags = Array.from(document.querySelectorAll('.tag-filter:checked'))
            .map(checkbox => checkbox.value);

        // Get selected player
        const selectedPlayer = document.querySelector('.player-filter:checked')?.value;

        // Filter photos based on selected tags and player
        const filteredPhotos = photosData.filter(photo => {
            const photoTags = (photo.Tags || '').replace(/[()]/g, '').split('/');
            const photoTagList = photoTags.map(tag => tag.trim());
            const photoPlayers = (photo.Player || '').split('/').map(player => player.trim());

            const tagsMatch = selectedTags.length === 0 || selectedTags.every(tag => photoTagList.includes(tag));
            const playerMatch = !selectedPlayer || photoPlayers.includes(selectedPlayer);

            return tagsMatch && playerMatch;
        });

        // Display filtered photos
        displayPhotos(filteredPhotos);
    }

    // Clear all selections
    function clearFilters() {
        // Uncheck all tag checkboxes and player radio buttons
        document.querySelectorAll('.tag-filter').forEach(checkbox => {
            checkbox.checked = false;
        });
        document.querySelectorAll('.player-filter').forEach(radio => {
            radio.checked = false;
        });
        displayPhotos(photosData); // Show all photos
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
    clearFiltersButton.addEventListener('click', clearFilters);
});
