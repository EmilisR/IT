"use strict";
$(function () {
    const gamesDatabaseUrl = 'http://localhost:3000/games';
    const gameDeleteSelector = '.delete-game';
    const formEl = $('form');
    const homeTeamTitle = $('#nba-home-team');
    const visitorTeamTitle = $('#nba-visitor-team');
    const homeTeamPoints = $('#nba-home-points');
    const visitorTeamPoints = $('#nba-visitor-points');
    const matchDate = $('#nba-match-date');
    const gamesListEl = $('.games-list');
    let games = [];
    function bindDeletes() {
        $(gameDeleteSelector).on('click.delete', event => {
            const row = $(event.target).closest('tr');
            row.css('background-color', '#dc354540');
            const gameid = $(event.target).closest('tr').attr('gameid');
            const game = $.grep(games, game => game.id == Number(gameid))[0];
            deleteGame(game, getGames);
        });
    }
    function rebindActions() {
        $(gameDeleteSelector).off('click.delete mouseenter.delete mouseleave.delete');
        bindDeletes();
    }
    function handleInvalidInput() {
        const homeTeamTitleError = $('#nba-home-team-help');
        const visitorTeamTitleError = $('#nba-visitor-team-help');
        const homeTeamPointsError = $('#nba-home-points-help');
        const visitorTeamPointsError = $('#nba-visitor-points-help');
        const matchDateError = $('#nba-match-date-help');
        isTitleValid(homeTeamTitle.val()) ? homeTeamTitleError.hide() : homeTeamTitleError.show();
        isTitleValid(visitorTeamTitle.val()) ? visitorTeamTitleError.hide() : visitorTeamTitleError.show();
        isPointsValid(homeTeamPoints.val()) ? homeTeamPointsError.hide() : homeTeamPointsError.show();
        isPointsValid(visitorTeamPoints.val()) ? visitorTeamPointsError.hide() : visitorTeamPointsError.show();
        isDateValid(matchDate.val()) ? matchDateError.hide() : matchDateError.show();
    }
    function bindFormSubmit() {
        formEl.on('submit', e => {
            e.preventDefault();
            if (!isTitleValid(homeTeamTitle.val()) || !isTitleValid(visitorTeamTitle.val()) || isPointsValid(homeTeamPoints.val()) || isPointsValid(visitorTeamPoints.val()) || isDateValid(matchDate.val())) {
                handleInvalidInput();
                return;
            }
            const newGame = createGameItem(String(homeTeamTitle.val()), String(visitorTeamTitle.val()), Number(homeTeamPoints.val()), Number(visitorTeamPoints.val()), String(matchDate.val()));
            saveNewGame(newGame, getGames);
            clearInputFields();
        });
    }
    function isTitleValid(title) {
        return title !== '';
    }
    function isPointsValid(number) {
        const points = parseInt(String(number));
        return points >= 0;
    }
    function isDateValid(dateEl) {
        const dateValues = /(\d{4})[\.\-\\](\d{2})[\.\-\\](\d{2})/.exec(String(dateEl));
        if (dateValues) {
            const date = new Date(Number(dateValues[1]), Number(dateValues[2]), Number(dateValues[3]));
            if (date.getDate() != Number(dateValues[3]))
                return false;
            return true;
        }
        return false;
    }
    function clearInputFields() {
        homeTeamTitle.val(''),
        visitorTeamTitle.val(''),
        homeTeamPoints.val(''),
        visitorTeamPoints.val(''),
        matchDate.val('');
    }
    function createGameItem(homeTeamTitle, visitorTeamTitle, homeTeamPoints, visitorTeamPoints, matchDate) {
        const maxCurrentId = Math.max(...games.map(game => game.id));
        return {
            id: maxCurrentId + 1,
            homeTeamTitle,
            visitorTeamTitle,
            homeTeamPoints,
            visitorTeamPoints,
            matchDate,
            difference: Math.abs(homeTeamPoints - visitorTeamPoints),
            winner: homeTeamPoints > visitorTeamPoints ? homeTeamTitle : visitorTeamTitle
        };
    }
    function createGameItemEl(game) {
        return todo.date;
    }
    function renderGames() {
        gamesListEl.find('tbody').html('');
        games.forEach(game => {
            appendGame(game);
        });
        rebindActions();
    }
    function appendGame(game) {
        gamesListEl.find('tbody').append(createGameItemEl(game));
    }
    function updateGame(game) {
        $.ajax({
            type: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            url: `${gameDatabaseUrl}/${game.id}`,
            data: JSON.stringify(game),
            success: () => {
                console.log('update successful!');
            }
        });
    }
    function saveNewGame(game, callback) {
        $.ajax({
            type: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            url: gamesDatabaseUrl,
            data: JSON.stringify(game),
            success: () => {
                callback && callback();
            }
        });
    }
    function deleteGame(game, callback) {
        $.ajax({
            type: 'DELETE',
            url: `${gameDatabaseUrl}/${game.id}`,
            success: () => {
                callback && callback();
            }
        });
    }
    function getGames() {
        games = [];
        $.getJSON(gamesDatabaseUrl, (tasks) => {
            games = tasks;
            renderGames();
        });
    }
    getGames();
    bindFormSubmit();
});
