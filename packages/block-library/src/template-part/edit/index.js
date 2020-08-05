/**
 * WordPress dependencies
 */
import { useRef, useEffect } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import { sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import useTemplatePartPost from './use-template-part-post';
import TemplatePartNamePanel from './name-panel';
import TemplatePartInnerBlocks from './inner-blocks';
import TemplatePartPlaceholder from './placeholder';

export default function TemplatePartEdit( {
	attributes: { postId: _postId, slug, theme },
	setAttributes,
	clientId,
	isSelected,
} ) {
	const initialPostId = useRef( _postId );
	const initialSlug = useRef( slug );
	const initialTheme = useRef( theme );

	// Resolve the post ID if not set, and load its post.
	const postId = useTemplatePartPost( _postId, slug, theme );

	// Set the post ID, once found, so that edits persist,
	// but wait until the third inner blocks change,
	// because the first 2 are just the template part
	// content loading.
	const { innerBlocks, hasSelectedInnerBlock } = useSelect(
		( select ) => {
			const {
				getBlocks,
				hasSelectedInnerBlock: getHasSelectedInnerBlock,
			} = select( 'core/block-editor' );
			return {
				innerBlocks: getBlocks( clientId ),
				hasSelectedInnerBlock: getHasSelectedInnerBlock(
					clientId,
					true
				),
			};
		},
		[ clientId ]
	);
	const { editEntityRecord } = useDispatch( 'core' );
	const blockChanges = useRef( 0 );
	useEffect( () => {
		if ( blockChanges.current < 4 ) blockChanges.current++;

		if (
			blockChanges.current === 3 &&
			( initialPostId.current === undefined ||
				initialPostId.current === null ) &&
			postId !== undefined &&
			postId !== null
		) {
			setAttributes( { postId } );
			editEntityRecord( 'postType', 'wp_template_part', postId, {
				status: 'publish',
			} );
		}
	}, [ innerBlocks ] );

	if ( postId ) {
		// Part of a template file, post ID already resolved.
		return (
			<TemplatePartEditor
				postId={ postId }
				slug={ slug }
				setAttributes={ setAttributes }
				isSelected={ isSelected }
				hasSelectedInnerBlock={ hasSelectedInnerBlock }
				innerBlocks={ innerBlocks }
			/>
		);
	}
	if ( ! initialSlug.current && ! initialTheme.current ) {
		// Fresh new block.
		return <TemplatePartPlaceholder setAttributes={ setAttributes } />;
	}
	// Part of a template file, post ID not resolved yet.
	return null;
}

const TemplatePartEditor = ( {
	postId,
	setAttributes,
	isSelected,
	hasSelectedInnerBlock,
	innerBlocks,
	slug,
} ) => {
	const hasBeenSelectedRef = useRef( false );
	const { createWarningNotice, removeNotice } = useDispatch( 'core/notices' );
	useEffect( () => {
		if (
			! hasBeenSelectedRef.current &&
			( isSelected || hasSelectedInnerBlock )
		) {
			createWarningNotice(
				sprintf(
					'You are editing %s.  Changes apply to everywhere this block is used.',
					slug
				),
				{
					type: 'snackbar',
					isDismissable: true,
					speak: true,
					id: 'template-part-edit-warning',
				}
			);
		} else if (
			hasBeenSelectedRef.current &&
			! ( isSelected || hasSelectedInnerBlock )
		) {
			removeNotice( 'template-part-edit-warning' );
		}
		hasBeenSelectedRef.current = isSelected || hasSelectedInnerBlock;
	}, [ isSelected, hasSelectedInnerBlock ] );
	// Part of a template file, post ID already resolved.
	return (
		<>
			{ ( isSelected || hasSelectedInnerBlock ) && (
				<TemplatePartNamePanel
					postId={ postId }
					setAttributes={ setAttributes }
				/>
			) }
			<TemplatePartInnerBlocks
				postId={ postId }
				hasInnerBlocks={ innerBlocks.length > 0 }
			/>
		</>
	);
};
