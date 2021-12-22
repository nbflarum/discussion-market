import get from 'lodash/get';

import { extend, override } from 'flarum/common/extend';
import Model from 'flarum/common/Model';
import Discussion from 'flarum/common/models/Discussion';
import DiscussionList from 'flarum/forum/components/DiscussionList';
import DiscussionListItem from 'flarum/forum/components/DiscussionListItem';
import Tooltip from 'flarum/common/components/Tooltip';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import Placeholder from 'flarum/common/components/Placeholder';
import DiscussionControls from 'flarum/utils/DiscussionControls';
import Dropdown from 'flarum/common/components/Dropdown';
import icon from 'flarum/common/helpers/icon';
import Link from 'flarum/common/components/Link';
import avatar from 'flarum/common/helpers/avatar';
import listItems from 'flarum/common/helpers/listItems';
import highlight from 'flarum/common/helpers/highlight';
import humanTime from 'flarum/common/utils/humanTime';
import ItemList from 'flarum/common/utils/ItemList';
import abbreviateNumber from 'flarum/common/utils/abbreviateNumber';

import DiscussionThumbnail from './components/DiscussionThumbnail';

const find = (obj, clazz) =>
    obj && obj.children && obj.children.filter((e) => get(e, 'attrs.className', '').indexOf(clazz) !== -1)[0];

app.initializers.add('nbflarum-discussion-market', () => {
    Discussion.prototype.customThumbnail = Model.attribute('itemThumbnail');
    override(DiscussionListItem.prototype, 'view', function (original) {
        //return original();
        const discussion = this.attrs.discussion;
        const user = discussion.user();
        const isUnread = discussion.isUnread();
        const isRead = discussion.isRead();
        const showUnread = !this.showRepliesCount() && isUnread;
        let jumpTo = 0;
        const controls = DiscussionControls.controls(discussion, this).toArray();
        const attrs = this.elementAttrs();
        const tags = this.attrs.params.tags;
        //console.log('tags:', tags);
        //console.log('discussion:', discussion);
        if (this.attrs.params.q) {
            const post = discussion.mostRelevantPost();
            if (post) {
                jumpTo = post.number();
            }

            const phrase = escapeRegExp(this.attrs.params.q);
            this.highlightRegExp = new RegExp(phrase + '|' + phrase.trim().replace(/\s+/g, '|'), 'gi');
        } else {
            jumpTo = Math.min(discussion.lastPostNumber(), (discussion.lastReadPostNumber() || 0) + 1);
        }
        const normal_return = (
            <div {...attrs}>
                {controls.length
                    ? Dropdown.component(
                          {
                              icon: 'fas fa-ellipsis-v',
                              className: 'DiscussionListItem-controls',
                              buttonClassName:
                                  'Button Button--icon Button--flat Slidable-underneath Slidable-underneath--right',
                              accessibleToggleLabel: app.translator.trans(
                                  'core.forum.discussion_controls.toggle_dropdown_accessible_label'
                              ),
                          },
                          controls
                      )
                    : ''}

                <span
                    className={
                        'Slidable-underneath Slidable-underneath--left Slidable-underneath--elastic' +
                        (isUnread ? '' : ' disabled')
                    }
                    onclick={this.markAsRead.bind(this)}
                >
                    {icon('fas fa-check')}
                </span>

                <div
                    className={
                        'DiscussionListItem-content Slidable-content' +
                        (isUnread ? ' unread' : '') +
                        (isRead ? ' read' : '')
                    }
                >
                    <Tooltip
                        text={app.translator.trans('core.forum.discussion_list.started_text', {
                            user,
                            ago: humanTime(discussion.createdAt()),
                        })}
                        position='right'
                    >
                        <Link className='DiscussionListItem-author' href={user ? app.route.user(user) : '#'}>
                            {avatar(user, { title: '' })}
                        </Link>
                    </Tooltip>

                    <ul className='DiscussionListItem-badges badges'>{listItems(discussion.badges().toArray())}</ul>

                    <Link href={app.route.discussion(discussion, jumpTo)} className='DiscussionListItem-main'>
                        <h3 className='DiscussionListItem-title'>
                            {highlight(discussion.title(), this.highlightRegExp)}
                        </h3>
                        <ul className='DiscussionListItem-info'>{listItems(this.infoItems().toArray())}</ul>
                    </Link>

                    <span
                        tabindex='0'
                        role='button'
                        className='DiscussionListItem-count'
                        onclick={this.markAsRead.bind(this)}
                        title={
                            showUnread ? app.translator.trans('core.forum.discussion_list.mark_as_read_tooltip') : ''
                        }
                    >
                        {abbreviateNumber(discussion[showUnread ? 'unreadCount' : 'replyCount']())}
                    </span>
                </div>
            </div>
        );
        let marketTags = app.forum.attribute("discussmarket.tags");
        if(!marketTags) return normal_return;
        marketTags = marketTags.toLowerCase().split(',');
        if (marketTags.indexOf(tags) === -1) {
            return normal_return;
        }
        //handle market UI
        const firstPost = this.attrs.discussion.firstPost();
        let likes = firstPost.likes();
       //console.log('likes:', likes);
        const image = this.attrs.discussion.customThumbnail();
        //console.log("image:",image);
        if (!image) return normal_return;

        const vnode = (
            <div {...attrs} style='margin:0px 0px;padding:10px 50px 10px 10px;'>
                {controls.length
                    ? Dropdown.component(
                          {
                              icon: 'fas fa-ellipsis-v',
                              className: 'DiscussionListItem-controls',
                              buttonClassName:
                                  'Button Button--icon Button--flat Slidable-underneath Slidable-underneath--right',
                              accessibleToggleLabel: app.translator.trans(
                                  'core.forum.discussion_controls.toggle_dropdown_accessible_label'
                              ),
                          },
                          controls
                      )
                    : ''}

                <span
                    className={
                        'Slidable-underneath Slidable-underneath--left Slidable-underneath--elastic' +
                        (isUnread ? '' : ' disabled')
                    }
                    onclick={this.markAsRead.bind(this)}
                >
                    {icon('fas fa-check')}
                </span>

                <div
                    className={
                        'DiscussionListItem-content Slidable-content' +
                        (isUnread ? ' unread' : '') +
                        (isRead ? ' read' : '')
                    }
                    style='margin:0px 0px;padding:0px 0px;'
                >
                    <Tooltip
                        text={app.translator.trans('core.forum.discussion_list.started_text', {
                            user,
                            ago: humanTime(discussion.createdAt()),
                        })}
                        position='right'
                    >
                        <Link className='DiscusionListItem-head' href={app.route.discussion(discussion, jumpTo)}>
                            <DiscussionThumbnail elementAttrs={avatar.attrs} src={image} />
                        </Link>
                    </Tooltip>

                    <ul className='DiscussionListItem-badges badges'>{listItems(discussion.badges().toArray())}</ul>

                    <Link href={app.route.discussion(discussion, jumpTo)} className='DiscussionListItem-main'>
                        <h3 className='DiscussionListItem-title' style='overflow:visible;margin-right:0px;'>
                            {highlight(discussion.title(), this.highlightRegExp)}
                        </h3>
                        <div className='Post-likedBy'>
                            {' '}
                            {icon('far fa-thumbs-up')} <span>{likes.length}</span>{' '}
                        </div>
                    </Link>

                    <span
                        tabindex='0'
                        role='button'
                        className='DiscussionListItem-count'
                        onclick={this.markAsRead.bind(this)}
                        title={
                            showUnread ? app.translator.trans('core.forum.discussion_list.mark_as_read_tooltip') : ''
                        }
                    >
                        {abbreviateNumber(discussion[showUnread ? 'unreadCount' : 'replyCount']())}
                    </span>
                </div>
            </div>
        );

        //modify UI
        setTimeout(() => {
            if (!likes) {
                fetch('/api/posts/' + firstPost.data.id)
                    .then((data) => data.json())
                    .then((json) => {
                        //console.log('data:', json);
                        likes = json.data.relationships.likes;
                        vnode.dom.querySelector('.Post-likedBy > span').innerText = likes.data.length;
                    });
            }
        }, 500);
        return vnode;
    });
    override(DiscussionList.prototype, 'view', function (original) {
        //return original();
        const state = this.attrs.state;

        const params = state.getParams();
        let loading;

        if (state.isInitialLoading() || state.isLoadingNext()) {
            loading = <LoadingIndicator />;
        } else if (state.hasNext()) {
            loading = Button.component(
                {
                    className: 'Button',
                    onclick: state.loadNext.bind(state),
                },
                app.translator.trans('core.forum.discussion_list.load_more_button')
            );
        }

        if (state.isEmpty()) {
            const text = app.translator.trans('core.forum.discussion_list.empty_text');
            return <div className='DiscussionList'>{Placeholder.component({ text })}</div>;
        }

        const normal_return = (
                <div className={'DiscussionList' + (state.isSearchResults() ? ' DiscussionList--searchResults' : '')}>
                    <ul className='DiscussionList-discussions'>
                        {state.getPages().map((pg) => {
                            return pg.items.map((discussion) => (
                                <li key={discussion.id()} data-id={discussion.id()}>
                                    {DiscussionListItem.component({ discussion, params })}
                                </li>
                            ));
                        })}
                    </ul>
                    <div className='DiscussionList-loadMore'>{loading}</div>
                </div>
            );

        const tags = params.tags;
        let marketTags = app.forum.attribute("discussmarket.tags");

         //console.log(app.forum.data.attributes)
        if(!marketTags) return normal_return;
        marketTags = marketTags.toLowerCase().split(',');

        if (marketTags.indexOf(tags) === -1) {
            return normal_return;
        }

        //modify UI
       // setTimeout(() => {
            const container = document.querySelectorAll('.container')[2];
            //console.log(container);
            if (container) {
                container.style.padding = '0px 0px';
                container.style.margin = '5px 15px 0px 15px';
                container.style.width = 'auto';
            }
       // }, 100);

        return (
            <div className={'DiscussionList' + (state.isSearchResults() ? ' DiscussionList--searchResults' : '')}>
                <ul className='DiscussionList-discussions'>
                    {state.getPages().map((pg) => {
                        return pg.items.map((discussion) => (
                            <li
                                key={discussion.id()}
                                data-id={discussion.id()}
                                style='float:left;display:block;margin:0px 0px;'
                            >
                                {DiscussionListItem.component({ discussion, params })}
                            </li>
                        ));
                    })}
                </ul>
                <div className='DiscussionList-loadMore'>{loading}</div>
            </div>
        );
    });
});
