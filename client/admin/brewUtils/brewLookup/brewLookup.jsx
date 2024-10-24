const React = require('react');
const createClass = require('create-react-class');
const cx    = require('classnames');

const request = require('superagent');
const Moment = require('moment');


const BrewLookup = createClass({
	getDefaultProps() {
		return {};
	},
	getInitialState() {
		return {
			query          : '',
			foundBrew      : null,
			searching      : false,
			error          : null,
			checkForScript : false,
			scriptCount    : undefined
		};
	},
	handleChange(e){
		this.setState({ query: e.target.value });
	},
	lookup(){
		this.setState({ searching: true, error: null, checkForScript: false, scriptCount: undefined });

		request.get(`/admin/lookup/${this.state.query}`)
			.then((res)=>this.setState({ foundBrew: res.body }))
			.catch((err)=>this.setState({ error: err }))
			.finally(()=>this.setState({ searching: false }));
	},

	checkForScript(){
		const brew = this.state.foundBrew;
		const scriptCheck = brew.text.match(/(<\/?s)cript/);
		this.setState({
			checkForScript : !!scriptCheck,
			scriptCount    : scriptCheck?.length || 0
		});
	},

	cleanScript(){
		if(!this.state.foundBrew?.shareId) return;

		request.put(`/admin/clean/script/${this.state.foundBrew.shareId}`)
			.then((res)=>this.setState({ foundBrew: res.body }))
			.catch((err)=>this.setState({ error: err }))
			.finally(()=>this.setState({ checkForScript: false, scriptCount: 0 }));
	},

	renderFoundBrew(){
		const brew = this.state.foundBrew;
		return <div className='foundBrew'>
			<dl>
				<dt>Title</dt>
				<dd>{brew.title}</dd>

				<dt>Authors</dt>
				<dd>{brew.authors.join(', ')}</dd>

				<dt>Edit Link</dt>
				<dd><a href={`/edit/${brew.editId}`} target='_blank' rel='noopener noreferrer'>/edit/{brew.editId}</a></dd>

				<dt>Share Link</dt>
				<dd><a href={`/share/${brew.shareId}`} target='_blank' rel='noopener noreferrer'>/share/{brew.shareId}</a></dd>

				<dt>Last Updated</dt>
				<dd>{Moment(brew.updatedAt).fromNow()}</dd>

				<dt>Num of Views</dt>
				<dd>{brew.views}</dd>
			</dl>
			<button onClick={this.checkForScript}>Scan for SCRIPTs</button>
			{(typeof this.state.scriptCount == 'number') && <p>Number of SCRIPT tags found: {this.state.scriptCount}</p>}
			{this.state.checkForScript && <button onClick={this.cleanScript}>CLEAN BREW</button>}
		</div>;
	},

	render(){
		return <div className='brewLookup'>
			<h2>Brew Lookup</h2>
			<input type='text' value={this.state.query} onChange={this.handleChange} placeholder='edit or share id' />
			<button onClick={this.lookup}>
				<i className={cx('fas', {
					'fa-search'          : !this.state.searching,
					'fa-spin fa-spinner' : this.state.searching,
				})} />
			</button>

			{this.state.error
				&& <div className='error'>{this.state.error.toString()}</div>
			}

			{this.state.foundBrew
				? this.renderFoundBrew()
				: <div className='noBrew'>No brew found.</div>
			}
		</div>;
	}
});

module.exports = BrewLookup;
