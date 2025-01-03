import { Body, Button, Container, Head, Heading, Hr, Html, Link, Preview, Section, Tailwind, Text } from "@react-email/components";

interface SendInviteTemplateProps {
  teamName: string
  inviterName: string
  inviteLink: string
}

export function SendInviteLinkTemplate({ inviteLink, inviterName, teamName }: SendInviteTemplateProps) {
  const previewText = `Convite de colaboração`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-465px]">
            <Section className="mt-[32px] text-center">
              <span className="font-bold text-lg">mail.in</span>
            </Section>
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Convite de colaboração no time {teamName}
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Você foi convidado por {inviterName} para colaborar com o time {teamName} na plataforma{' '}
              mail.in. Aqui, você poderá fazer envios de e-mail em massa e explorar muitas {' '}
              outras funcionalidades.
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-sky-500 rounded text-white px-5 py-3 text-[12px] font-semibold no-underline text-center"
                href={inviteLink}
              >
                Aceitar solicitação
              </Button>
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              ou copie a URL abaixo e cole em seu browser:{' '}
              <Link href={inviteLink} className="text-sky-500 no-underline">
                {inviteLink}
              </Link>
            </Text>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              Seu convite tem validade de 7 dias.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}