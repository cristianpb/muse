describe('Sapper template app', () => {
	beforeEach(() => {
		cy.visit('/')
	});

	it('has the correct <h1>', () => {
		cy.contains('h1', 'Now playing')
	});

	it('navigates to /search', () => {
		cy.get('nav a').contains('Search').click();
		cy.url().should('include', '/search');
	});

	it('navigates to /browse', () => {
		cy.get('nav a').contains('Browse').click();
		cy.url().should('include', '/browse');
	});
});
