<?php
add_action('init', 'cp_register_playlist_post_type');

function cp_register_playlist_post_type() {
  register_post_type('playlist', [
    'labels' => [
      'name' => 'Playlists',
      'singular_name' => 'Playlist',
    ],
    'public' => true,
    'has_archive' => true,
    'show_in_rest' => true,
    'supports' => ['title', 'editor', 'thumbnail'],
    'menu_icon' => 'dashicons-playlist-audio',
    'show_in_graphql' => true,
    'graphql_single_name' => 'playlist',
    'graphql_plural_name' => 'playlists',
  ]);
}
