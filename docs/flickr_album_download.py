import flickrapi
import requests
import os
import time
import csv
import argparse

# Replace with your API key and secret
api_key = 'API KEY'
api_secret = 'API SECRET'

# Create the flickr object
flickr = flickrapi.FlickrAPI(api_key, api_secret, format='parsed-json')

# Function to get photos from the album
def get_photos_from_album(album_id, user_id):
    # Get photos from the album
    photos = flickr.photosets.getPhotos(photoset_id=album_id, user_id=user_id)
    return photos['photoset']['photo']

# Function to download the photo by ID
def download_photo(photo_id, save_folder):
    # Get the available sizes of the photo
    sizes = flickr.photos.getSizes(photo_id=photo_id)
    
    # Get the URL of the 'Original' or 'Large' size image
    url = next((size['source'] for size in sizes['sizes']['size'] if size['label'] == 'Original' or size['label'] == 'Large'), None)
    
    if url:
        # Use the photo ID as the filename (e.g., '1234567890.jpg')
        filename = f"{photo_id}.jpg"

        # Download the image
        response = requests.get(url)
        
        if response.status_code == 200:
            # Create a folder if it doesn't exist
            if not os.path.exists(save_folder):
                os.makedirs(save_folder)

            # Save the image in the folder
            with open(os.path.join(save_folder, filename), 'wb') as f:
                f.write(response.content)
            print(f"Downloaded: {filename}")
        else:
            print(f"Failed to download: {filename}")
    else:
        print(f"No suitable size found for photo {photo_id}")

# Function to retrieve photo details (ID, title, tags, URL)
def get_photo_details(photo):
    photo_id = photo['id']
    title = photo['title']
    # Get tags for the photo
    tags = flickr.photos.getInfo(photo_id=photo_id)['photo']['tags']['tag']
    tag_list = [tag['_content'] for tag in tags]
    # Get the URL of the photo
    sizes = flickr.photos.getSizes(photo_id=photo_id)
    url = next((size['source'] for size in sizes['sizes']['size'] if size['label'] == 'Original'), None)
    
    return {
        'photo_id': photo_id,
        'title': title,
        'tags': tag_list,
        'url': url
    }

# Main function
def main():
    # Set up argument parser
    parser = argparse.ArgumentParser(description="Download photos from a Flickr album and save details to CSV.")
    parser.add_argument('album_id', help="The ID of the Flickr album.")
    parser.add_argument('output_csv', help="The name of the output CSV file.")
    args = parser.parse_args()

    # Get photos from the album
    user_id = 'USER ID'  # Replace with your Flickr user ID
    photos = get_photos_from_album(args.album_id, user_id)

    # Create a folder using the CSV name (without the '.csv' extension) and append '_photos' to the folder name
    folder_name = os.path.splitext(args.output_csv)[0] + '_photos'
    
    # Save photo details to CSV
    with open(args.output_csv, 'w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow(['Photo ID', 'Title', 'Tags', 'URL'])
        
        # Process each photo in the album
        for photo in photos:
            details = get_photo_details(photo)
            writer.writerow([details['photo_id'], details['title'], ', '.join(details['tags']), details['url']])
            
            # Download the photo
            download_photo(details['photo_id'], folder_name)
            
            # Wait to respect API rate limits
            time.sleep(2)

    print(f"All photos have been downloaded and details saved to '{args.output_csv}'.")

if __name__ == "__main__":
    main()
