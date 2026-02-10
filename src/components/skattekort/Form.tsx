import { actions } from "astro:actions";
import { EraserIcon, MagnifyingGlassIcon } from "@navikt/aksel-icons";
import {
	Alert,
	Button,
	Heading,
	HelpText,
	TextField,
	ToggleGroup,
} from "@navikt/ds-react";
import { useState } from "react";
import type { Response } from "../../types/Response";
import styles from "./Form.module.css";

interface SkattekortFormProps {
	currentYear?: number;
}

export default function Form({
	currentYear = new Date().getFullYear(),
}: SkattekortFormProps) {
	const [fnr, setFnr] = useState("");
	const [inntektsaar, setInntektsaar] = useState(currentYear.toString());
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [data, setData] = useState<Response | null>(null);
	const [fnrError, setFnrError] = useState<string | null>(null);

	const getYears = () => {
		const now = new Date();
		const isAfterDec15 = now.getMonth() === 11 && now.getDate() >= 15;

		if (isAfterDec15) {
			return [currentYear, currentYear + 1];
		}
		return [currentYear - 1, currentYear];
	};

	const years = getYears();

	const validateFnr = (value: string): string | null => {
		if (!value) {
			return "Fødselsnummer er påkrevd";
		}
		if (value.length !== 11) {
			return "Fødselsnummer må være 11 siffer";
		}
		if (!/^\d{11}$/.test(value)) {
			return "Fødselsnummer må inneholde kun tall";
		}
		return null;
	};

	const handleFnrChange = (value: string) => {
		setFnr(value);
		setFnrError(null);
		setError(null);
	};

	const handleReset = () => {
		setFnr("");
		setFnrError(null);
		setError(null);
		setData(null);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setData(null);

		const validationError = validateFnr(fnr);
		if (validationError) {
			setFnrError(validationError);
			return;
		}

		setLoading(true);

		try {
			const { data, error } = await actions.hentSkattekort({
				fnr,
				inntektsaar: parseInt(inntektsaar, 10),
			});

			if (error) {
				throw new Error(
					error.message || "Noe gikk galt ved henting av skattekort",
				);
			}

			setData(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Noe gikk galt");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className={styles.container}>
			<Heading level="1" size="large" spacing>
				Skattekort
			</Heading>
			<div className={styles.box}>
				<div className={styles.helptext}>
					<HelpText title="Hjelp">
						Søk etter skattekort ved å oppgi fødselsnummer og velge år.
					</HelpText>
				</div>

				<form onSubmit={handleSubmit} className={styles.form}>
					<div className={styles.formLeft}>
						<TextField
							label="Gjelder"
							size="small"
							value={fnr}
							onChange={(e) => handleFnrChange(e.target.value)}
							error={fnrError}
							autoComplete="off"
							maxLength={11}
							className={styles.input}
						/>

						<ToggleGroup
							label="År"
							value={inntektsaar}
							onChange={(value) => setInntektsaar(value)}
							size="small"
						>
							{years.map((year) => (
								<ToggleGroup.Item key={year} value={year.toString()}>
									{year}
								</ToggleGroup.Item>
							))}
						</ToggleGroup>
					</div>

					<div className={styles.formRight}>
						<Button
							type="button"
							size="small"
							icon={<EraserIcon />}
							iconPosition="right"
							variant="secondary"
							onClick={handleReset}
						>
							Nullstill
						</Button>
						<Button
							type="submit"
							size="small"
							icon={<MagnifyingGlassIcon />}
							iconPosition="right"
							loading={loading}
						>
							Søk
						</Button>
					</div>
				</form>
			</div>

			{error && (
				<Alert variant="error" className={styles.alert}>
					{error}
				</Alert>
			)}

			{data && data.length === 0 && (
				<Alert variant="info" className={styles.alert}>
					Ingen skattekort funnet for det valgte året.
				</Alert>
			)}

			{data?.map((at) => (
				<div key={at.arbeidstakeridentifikator} className={styles.result}>
					<Heading level="3" size="small" spacing>
						Skattekort for {at.arbeidstakeridentifikator}
					</Heading>

					<div className={styles.arbeidstaker}>
						<dl className={styles.details}>
							<dt>Inntektsår:</dt>
							<dd>{at.inntektsaar}</dd>

							<dt>Resultat:</dt>
							<dd>{at.resultatPaaForespoersel}</dd>

							{at.skattekort && (
								<>
									{at.skattekort.utstedtDato && (
										<>
											<dt>Utstedt dato:</dt>
											<dd>{at.skattekort.utstedtDato}</dd>
										</>
									)}

									{at.skattekort.skattekortidentifikator && (
										<>
											<dt>Skattekort ID:</dt>
											<dd>{at.skattekort.skattekortidentifikator}</dd>
										</>
									)}

									{at.skattekort.forskuddstrekk &&
										at.skattekort.forskuddstrekk.length > 0 && (
											<>
												<dt>Forskuddstrekk:</dt>
												<dd>
													<ul className={styles.forskuddstrekkList}>
														{at.skattekort.forskuddstrekk.map((ft, ftIndex) => (
															<li key={`${ft.trekkode}-${ft.type}-${ftIndex}`}>
																<strong>{ft.type}</strong> ({ft.trekkode})
																{ft.type === "Trekkprosent" &&
																	ft.prosentsats && (
																		<span> - {ft.prosentsats}%</span>
																	)}
																{ft.type === "Trekktabell" &&
																	ft.tabellnummer && (
																		<span> - Tabell {ft.tabellnummer}</span>
																	)}
																{ft.type === "Frikort" && ft.frikortbeloep && (
																	<span>
																		{" "}
																		- Frikortbeløp: {ft.frikortbeloep}
																	</span>
																)}
															</li>
														))}
													</ul>
												</dd>
											</>
										)}
								</>
							)}

							{at.tilleggsopplysning && at.tilleggsopplysning.length > 0 && (
								<>
									<dt>Tilleggsopplysninger:</dt>
									<dd>{at.tilleggsopplysning.join(", ")}</dd>
								</>
							)}
						</dl>
					</div>
				</div>
			))}
		</div>
	);
}
