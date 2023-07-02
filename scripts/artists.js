const clientId = '7a536f43424e4e1fad43dd3777470cad';
const clientSecret = '333def59ecae428797f341d934b304fd';

const authString = `${clientId}:${clientSecret}`;
const base64AuthString = btoa(authString);

async function getAccessToken() {
    try {
        let response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${base64AuthString}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'grant_type=client_credentials'
        });

        if (response.ok) {
            let data = await response.json();
            return data.access_token;
        } else {
            throw new Error('Response failed');
        }
    } catch (error) {
        console.log('Error:', error);
    }
}


const artistSearchSection = document.querySelector('#artist-search');
const artistSearchButton = document.querySelector('#artist-search-button');
const artistInput = document.querySelector('#artist-input');


document.addEventListener('DOMContentLoaded', (event) => {
    if (localStorage.getItem('runSearchArtist') === 'true') {
        var inputValue = localStorage.getItem('artistInput');

        artistInput.value = inputValue;
        searchArtist();

        localStorage.setItem('runSearchArtist', 'false');
    } else if (localStorage.getItem('runPopulateArtist') === 'true') {
        var artistId = localStorage.getItem('artistId');
        populateArtistDisplay(artistId);

        localStorage.setItem('runPopulateArtist', 'false');
    }
});

function searchArtist() {

    if (document.querySelector('#search-results')) {
        const searchResults = document.querySelector('#search-results');
        artistSearchSection.removeChild(searchResults);
    }

    if (artistInput.value === '') {
        const popup = document.createElement('div');
        popup.id = 'popup';
        popup.innerHTML = 'Enter an artist name!';
        artistSearchSection.appendChild(popup);
        setTimeout(() => {
            artistSearchSection.removeChild(popup);
        }, 3000);
        return;
    }

    getAccessToken().then(accessToken => {
        fetch(`https://api.spotify.com/v1/search?q=artist:${artistInput.value}&type=artist`, {
                headers: {
                    'Authorization': 'Bearer ' + accessToken
                }
            })
            .then(response => response.json())
            .then(data => {
                const searchResults = document.createElement('ul');
                searchResults.id = 'search-results';

                if (data.artists.items.length === 0) {
                    const noResults = document.createElement('li');
                    noResults.classList.add('search-result');
                    noResults.innerHTML = 'No results found!';
                    searchResults.appendChild(noResults);
                } else {
                    const topResults = data.artists.items.slice(0, 5);
                    topResults.forEach(artist => {
                        const result = document.createElement('li');
                        result.classList.add('search-result');
                        result.innerHTML = artist.name + ' (' + artist.followers.total + ' followers)';
                        result.dataset.artistId = artist.id;
                        result.addEventListener('click', () => {
                            populateArtistDisplay(result.dataset.artistId);
                            artistSearchSection.removeChild(searchResults);
                            document.getElementById("artist-display").scrollIntoView()
                        })
                        searchResults.appendChild(result);
                    })
                }
                artistSearchSection.appendChild(searchResults);
            })
            .catch(error => {
                console.log(error);
            });
    });

}

function populateArtistDisplay(artistId) {
    getAccessToken().then(accessToken => {
        fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
                headers: {
                    'Authorization': 'Bearer ' + accessToken
                }
            })
            .then(response => {
                return response.json()
            })
            .then(data => {
                const artistDisplay = document.querySelector('#artist-display');
                while (artistDisplay.firstChild) {
                    artistDisplay.removeChild(artistDisplay.firstChild);
                }

                const artistArt = document.createElement('img');
                artistArt.id = 'artist-art';

                const artistText = document.createElement('div');

                const artistName = document.createElement('h1');
                const artistFollowers = document.createElement('p');
                const artistPopularity = document.createElement('p');
                const artistGenres = document.createElement('p');

                artistText.id = 'artist-text-info';

                artistText.appendChild(artistName);
                artistText.appendChild(artistFollowers);
                artistText.appendChild(artistPopularity);
                artistText.appendChild(artistGenres);

                artistArt.src = data.images[0].url;
                artistName.innerHTML = data.name;
                artistFollowers.innerHTML = data.followers.total.toLocaleString('en-US') + ' Spotify followers';
                artistPopularity.innerHTML = data.popularity + ' popularity';
                artistGenres.innerHTML = data.genres.join(', ');

                artistDisplay.appendChild(artistArt);
                artistDisplay.appendChild(artistText);

                fetch(`https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album&limit=5`, {
                        headers: {
                            'Authorization': 'Bearer ' + accessToken
                        }
                    })
                    .then(response => {
                        return response.json()
                    })
                    .then(data => {
                        console.log(data)
                        const albumsDisplay = document.querySelector('#albums-display');
                        while (albumsDisplay.firstChild) {
                            albumsDisplay.removeChild(albumsDisplay.firstChild);
                        }

                        if (document.querySelector('#artist-albums-header')) {
                            document.querySelector('#artist-albums').removeChild(document.querySelector('#artist-albums-header'));
                        }

                        const artistAlbumsHeader = document.createElement('h1');
                        artistAlbumsHeader.innerHTML = 'Recent Albums';
                        artistAlbumsHeader.id = 'artist-albums-header';
                        document.querySelector('#artist-albums').insertBefore(artistAlbumsHeader, document.querySelector('#artist-albums').firstChild);

                        data.items.forEach(album => {

                            const albumInfo = document.createElement('div');
                            albumInfo.classList.add('album-info');
                            const albumArt = document.createElement('img');
                            albumArt.src = album.images[0].url;
                            albumArt.classList.add('album-art');

                            albumArt.addEventListener('mouseover', () => {
                                document.body.style.transition = `all ease 1s`;
                                document.body.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${albumArt.getAttribute("src")}`;
                            })

                            albumArt.addEventListener('click', () => {
                                fetch(`https://api.spotify.com/v1/albums/${album.id}`, {
                                        headers: {
                                            'Authorization': 'Bearer ' + accessToken
                                        }
                                    })
                                    .then(response => {
                                        return response.json()
                                    })
                                    .then(data => {
                                        localStorage.setItem('runPopulateAlbum', 'true');
                                        localStorage.setItem('albumData', JSON.stringify(data));
                                        window.location.href = 'index.html';
                                    })
                                    .catch(error => {
                                        console.log(error);
                                    });
                            });

                            const albumName = document.createElement('h1');
                            albumName.innerHTML = album.name;
                            albumName.classList.add('album-name');

                            const albumReleaseDate = document.createElement('p');
                            albumReleaseDate.innerHTML = album.release_date.slice(0, 4);
                            albumReleaseDate.classList.add('album-release-date');

                            albumInfo.appendChild(albumArt);
                            albumInfo.appendChild(albumName);
                            albumInfo.appendChild(albumReleaseDate);

                            albumsDisplay.appendChild(albumInfo);
                        })
                    })
                    .catch(error => {
                        console.log(error);
                    });

            })
            .catch(error => {
                console.log(error);
            });
    });

}

artistSearchButton.addEventListener('click', searchArtist);