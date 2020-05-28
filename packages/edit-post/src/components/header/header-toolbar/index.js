/**
 * WordPress dependencies
 */
import { useViewportMatch } from '@wordpress/compose';
import { useSelect } from '@wordpress/data';
import { __, _x } from '@wordpress/i18n';
import {
	BlockToolbar,
	NavigableToolbar,
	BlockNavigationDropdown,
	ToolSelector,
} from '@wordpress/block-editor';
import {
	TableOfContents,
	EditorHistoryRedo,
	EditorHistoryUndo,
} from '@wordpress/editor';
import { Button } from '@wordpress/components';
import { plus } from '@wordpress/icons';

function HeaderToolbar( { onToggleInserter, isInserterOpen } ) {
	const {
		hasReducedUI,
		hasFixedToolbar,
		isInserterEnabled,
		isTextModeEnabled,
		previewDeviceType,
	} = useSelect( ( select ) => {
		const {
			hasInserterItems,
			getBlockRootClientId,
			getBlockSelectionEnd,
		} = select( 'core/block-editor' );
		return {
			hasFixedToolbar: select( 'core/edit-post' ).isFeatureActive(
				'fixedToolbar'
			),
			// This setting (richEditingEnabled) should not live in the block editor's setting.
			isInserterEnabled:
				select( 'core/edit-post' ).getEditorMode() === 'visual' &&
				select( 'core/editor' ).getEditorSettings()
					.richEditingEnabled &&
				hasInserterItems(
					getBlockRootClientId( getBlockSelectionEnd() )
				),
			isTextModeEnabled:
				select( 'core/edit-post' ).getEditorMode() === 'text',
			previewDeviceType: select(
				'core/edit-post'
			).__experimentalGetPreviewDeviceType(),
			hasReducedUI: select( 'core/edit-post' ).isFeatureActive(
				'reducedUI'
			),
		};
	}, [] );
	const isLargeViewport = useViewportMatch( 'medium' );

	const displayBlockToolbar =
		! isLargeViewport || previewDeviceType !== 'Desktop' || hasFixedToolbar;

	if ( hasReducedUI && ! displayBlockToolbar ) {
		return null;
	}

	const toolbarAriaLabel = displayBlockToolbar
		? /* translators: accessibility text for the editor toolbar when Top Toolbar is on */
		  __( 'Document and block tools' )
		: /* translators: accessibility text for the editor toolbar when Top Toolbar is off */
		  __( 'Document tools' );

	return (
		<NavigableToolbar
			className="edit-post-header-toolbar"
			aria-label={ toolbarAriaLabel }
		>
			{ ! hasReducedUI && (
				<>
					<Button
						className="edit-post-header-toolbar__inserter-toggle"
						isPrimary
						isPressed={ isInserterOpen }
						onClick={ onToggleInserter }
						disabled={ ! isInserterEnabled }
						icon={ plus }
						label={ _x(
							'Add block',
							'Generic label for block inserter button'
						) }
					/>
					<ToolSelector />
					<EditorHistoryUndo />
					<EditorHistoryRedo />
					<TableOfContents
						hasOutlineItemsDisabled={ isTextModeEnabled }
					/>
					<BlockNavigationDropdown isDisabled={ isTextModeEnabled } />
				</>
			) }
			{ displayBlockToolbar && (
				<div className="edit-post-header-toolbar__block-toolbar">
					<BlockToolbar hideDragHandle />
				</div>
			) }
		</NavigableToolbar>
	);
}

export default HeaderToolbar;
