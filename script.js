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

        // Collect all unique tags from the photos
        photos.forEach(photo => {
            const tags = (photo.Tags || '').replace(/[()]/g, '').split('/');
            tags.forEach(tag => tagsSet.add(tag.trim()));
        });

        // Add default "All Tags" option
        const allOption = document.createElement('option');
        allOption.value = '';
        allOption.textContent = 'All Tags';
        tagSelect.appendChild(allOption);

        // Add each tag to the dropdown
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
