<?php

/*
 * This file is part of nb/discussion-market.
 *
 * Copyright (c) FriendsOfFlarum.
 *
 * For the full copyright and license information, please view the LICENSE.md
 * file that was distributed with this source code.
 */

namespace Nbflarum\DiscussionMarket;

use Flarum\Api\Serializer\BasicDiscussionSerializer;
use Flarum\Extend;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
        ->css(__DIR__.'/resources/less/forum.less'),
    (new Extend\Frontend('admin'))
        ->js(__DIR__.'/js/dist/admin.js'),

     (new Extend\ApiSerializer(BasicDiscussionSerializer::class))
        ->attributes(Listener\AddThumbnail::class),
        
    (new Extend\Settings)
      ->serializeToForum('discussmarket.tags', 'discussmarket.tags'),
];
