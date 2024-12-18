document.addEventListener('DOMContentLoaded', () => {
    const tagCheckboxContainer = document.getElementById('tag-checkboxes');
    const photoGallery = document.getElementById('photo-gallery');
    const modal = document.getElementById('photo-modal');
    const modalImage = document.getElementById('modal-image');
    const closeModal = document.querySelector('.close');

    let photosData = []; // Store all photos data to filter

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
            checkbox.addEventListener('change', filterPhotosByTags);
        });
    }

    function filterPhotosByTags() {
        // Get all selected tags
        const selectedTags = Array.from(document.querySelectorAll('.tag-filter:checked'))
            .map(checkbox => checkbox.value);

        // Filter photos by selected tags
        const filteredPhotos = selectedTags.length > 0
            ? photosData.filter(photo => {
                  const photoTags = (photo.Tags || '').replace(/[()]/g, '').split('/');
                  const photoTagList = photoTags.map(tag => tag.trim());
                  return selectedTags.every(tag => photoTagList.includes(tag)); // Match all selected tags
              })
            : photosData; // No tags selected, show all photos

        displayPhotos(filteredPhotos);
    }

    // Load CSV file
    Papa.parse('./photos.csv', {
        download: true,
        header: true,
        complete: function(results) {
            photosData = results.data;
            populateTags(photosData);
            displayPhotos(photosData); // Display all photos initially
        }
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

// Modal functionality for enlarging photos
const modal = document.getElementById('photo-modal');
const modalImage = document.getElementById('modal-image');
const closeModal = document.querySelector('.close');

// Close modal when clicked outside the image or on the close button
closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

modal.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});
