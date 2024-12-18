document.addEventListener('DOMContentLoaded', () => {
    const tagSelect = document.getElementById('tag-select');
    const photoGallery = document.getElementById('photo-gallery');

    function displayPhotos(photos) {
        const photoGallery = document.getElementById('photo-gallery');
        const modal = document.getElementById('photo-modal');
        const modalImage = document.getElementById('modal-image');
        const closeModal = document.querySelector('.close');

        photoGallery.innerHTML = ''; // Clear the gallery

        // Display each photo
        photos.forEach(photo => {
            const photoItem = document.createElement('div');
            photoItem.className = 'photo-item';

            // Construct the local file path using the "Photo ID" field
            const photoPath = `./photos/${photo["Photo ID"]}.jpg`;

            // Retrieve Player and Set values, defaulting to an empty string if undefined
            const player = photo.Player || '';
            const set = photo.Set || '';

            photoItem.innerHTML = `
                <img src="${photoPath}" alt="${photo.Title}" loading="lazy">
                <p>${player} ${set}</p>
                <a href="#" class="view-full-photo">Enlarge Photo</a>
                <button class="like-button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-heart" viewBox="0 0 16 16">
                        <path d="M8 2.748-.717-1.481 8 8l8-5.229L8 2.748z"/>
                    </svg>
                    Like
                    <span class="like-count">0</span> <!-- Initialize like count -->
                </button>
            `;

            // Append the photo item to the gallery
            photoGallery.appendChild(photoItem);

            // Add event listener for the modal
            const viewLink = photoItem.querySelector('.view-full-photo');
            viewLink.addEventListener('click', (event) => {
                event.preventDefault(); // Prevent navigation
                modal.style.display = 'block';
                modalImage.src = photoPath; // Set the image in the modal
            });

            // Add event listener for the like button
            const likeButton = photoItem.querySelector('.like-button');
            const likeCountSpan = photoItem.querySelector('.like-count');
            let likeCount = 0;

            likeButton.addEventListener('click', () => {
                // Toggle the like state
                likeButton.classList.toggle('liked');

                // Increase or decrease the like count
                if (likeButton.classList.contains('liked')) {
                    likeCount++;
                } else {
                    likeCount--;
                }

                // Update the displayed like count
                likeCountSpan.textContent = likeCount;
            });
        });

        // Close the modal when the close button is clicked
        closeModal.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        // Close the modal when clicking outside the image
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    function populateTags(photos) {
        const tagSelect = document.getElementById('tag-select');
        const tagsSet = new Set();

        // Define the tags to exclude
        const excludedTags = new Set(['BRAVES', '', 'All Tags', 'EXPOS', 'PADRES', 'MARINERS', 'INDIANS', 'RANGERS', 'USA', 'TWINS']);

        // Collect all unique tags from the photos
        photos.forEach(photo => {
            const tags = (photo.Tags || '').replace(/[()]/g, '').split('/');
            tags.forEach(tag => {
                const trimmedTag = tag.trim();
                // Add the tag only if it's not in the excluded list
                if (!excludedTags.has(trimmedTag.toUpperCase())) {
                    tagsSet.add(trimmedTag);
                }
            });
        });

        // Add each tag to the dropdown, sorted alphabetically
        Array.from(tagsSet).sort().forEach(tag => {
            const option = document.createElement('option');
            option.value = tag;
            option.textContent = tag;
            tagSelect.appendChild(option);
        });
    }

    // Load CSV file
    Papa.parse('./photos.csv', {
        download: true,
        header: true,
        complete: function(results) {
            const photos = results.data;
            populateTags(photos);
            displayPhotos(photos);

            // Dropdown change event
            tagSelect.addEventListener('change', () => {
                const selectedTag = tagSelect.value;

                // Filter photos based on whether the selected tag is included
                const filteredPhotos = selectedTag
                    ? photos.filter(photo => {
                          // Remove parentheses and check if the tag exists
                          const tags = (photo.Tags || '').replace(/[()]/g, '').split('/');
                          return tags.map(tag => tag.trim()).includes(selectedTag);
                      })
                    : photos; // If no tag selected, show all photos

                displayPhotos(filteredPhotos);
            });
        }
    });
});

// Select the button
const backToTopButton = document.getElementById('back-to-top');

// Show/hide the button based on scroll position
window.addEventListener('scroll', () => {
    if (window.scrollY > 200) { // Show after scrolling down 200px
        backToTopButton.style.display = 'flex'; // Use 'flex' to center content
    } else {
        backToTopButton.style.display = 'none';
    }
});

// Scroll to top when button is clicked
backToTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // Smooth scrolling
    });
});
