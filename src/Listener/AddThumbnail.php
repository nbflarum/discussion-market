<?php

/*
 * This file is part of nb/discussion-market.
 *
 * Copyright (c) FriendsOfFlarum.
 *
 * For the full copyright and license information, please view the LICENSE.md
 * file that was distributed with this source code.
 */

namespace Nb\DiscussionMarket\Listener;

use Flarum\Api\Serializer\BasicDiscussionSerializer;
use Flarum\Discussion\Discussion;
use Flarum\Post\CommentPost;
use Illuminate\Contracts\Cache\Repository;
use Illuminate\Support\Arr;

function mlog(){
        $args = func_get_args();
        foreach ($args as $arg){
            file_put_contents('debug.txt', var_export($arg,true)."\n",FILE_APPEND);
        }
}

class AddThumbnail
{
    /**
     * @var Repository
     */
    protected $cache;

    public function __construct(Repository $cache)
    {
        $this->cache = $cache;
    }

    public function __invoke(BasicDiscussionSerializer $serializer, Discussion $discussion)
    {
        
        $post = $discussion->firstPost;

        if (!($post instanceof CommentPost)) {
            return [];
        }

        $key = "nb-discussion-market.discussion.{$post->id}";
        $cached = $this->cache->get($key);
        $thumbnail = Arr::get($cached, 'url');

        if (!$this->cache->has($key) || ($post->edited_at && Arr::has($cached, 'date') && $post->edited_at->isAfter($cached['date']))) {
            $content = $discussion->firstPost->formatContent();

            if (!$content) {
                return [];
            }

            preg_match('/<img.+?src=[\"\'](.+?)[\"\'].*?>/i', $content, $match);

            $thumbnail = @$match[1];

            $this->cache->forever($key, $match ? [
                'url'  => @$match[1],
                'date' => $post->edited_at,
            ] : null);
        }

        $attributes['itemThumbnail'] = $thumbnail;

        mlog($thumbnail);

        return $attributes;
    }
}
