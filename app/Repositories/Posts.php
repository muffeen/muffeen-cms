<?php

namespace App\Repositories;

use App\Models\Post;
use DB;

class Posts
{

    public static function getAllWithLimit($limit, $offset = 0)
    {
        return Post::select(['id', 'title', 'author', 'category_id', 'slug', 'created_at'])
            ->with([
                'category' => function($query){
                    $query->select('id','name');
                },
                'user' => function($query) {
                    $query->select('id', 'name');
                }
            ])
            ->orderBy('created_at', 'desc')
            ->take($limit)
            ->offset($offset)
            ->get();
    }

    public static function getMostRecent($limit, $offset = 0)
    {
        return Post::orderBy('created_at', 'desc')
            ->take($limit)
            ->offset($offset)
            ->get();
    }

    public static function getCount()
    {
        return Post::count();
    }

    public static function getMostRecentByCategory($category_id, $limit, $offset = 0)
    {
        return Post::where('category_id', '=', $category_id)
            ->orderBy('created_at', 'desc')
            ->take($limit)
            ->offset($offset)
            ->get();
    }

    public static function getCountByCategory($category_id)
    {
        return Post::where('category_id', '=', $category_id)
            ->count();
    }

    public static function getMostRecentByTag($tag_id, $limit, $offset = 0)
    {
        return Post::where('posts_tags_relation.tag_id', '=', $tag_id)
            ->join('posts_tags_relation', 'posts.id', '=', 'posts_tags_relation.post_id')
            ->orderBy('posts.created_at', 'desc')
            ->take($limit)
            ->offset($offset)
            ->get();
    }

    public static function getCountByTag($tag_id)
    {
        return Post::where('posts_tags_relation.tag_id', '=', $tag_id)
            ->join('posts_tags_relation', 'posts.id', '=', 'posts_tags_relation.post_id')
            ->count();
    }

    public static function getLatestOnLastThirtyDaysWithLimit($limit)
    {
       return Post::where(DB::raw("DATEDIFF(NOW(), 'created_at')", '<=', 30))
            ->limit($limit)
            ->get();
    }

}